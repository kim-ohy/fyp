"""
utils/rr.py
This file contains the RRMonitoringModel class, which is used to monitor the respiratory rate of the person.
It uses the depth frame and the keypoints to calculate the respiratory rate.
"""

import numpy as np
import cv2
from collections import deque
from scipy.ndimage import uniform_filter1d


class RRMonitoringModel:
    def __init__(self, fps=30, window_seconds=20, box_width=100, box_height=100):
        self.FPS = fps
        self.BUFFER_SIZE = fps * window_seconds
        self.BOX_WIDTH = box_width
        self.BOX_HEIGHT = box_height

        self.background_frame = None
        self.frame_count = 0

        self.activity_history = deque(maxlen=self.BUFFER_SIZE)

        self.roi_box = None
        self.roi_center_x = None
        self.roi_center_y = None
        self.frame_count = 0
        self.rr = 0

        self.breathing_signal = []
        self.activity_level = 0

        self.peak_threshold = 0
        self.peak_counter = 0
        self.above = False

    # calculate the activity level
    def calc_activity_level(self, roi):
        # check if the background frame is set and the shape of the roi is the same as the background frame
        if self.background_frame is None or roi.shape != self.background_frame.shape:
            self.activity_level = 0
            return

        # calculate the delta between the roi and the background frame
        delta = roi.astype(np.int16) - self.background_frame.astype(np.int16)

        # calculate the absolute delta
        abs_delta = np.abs(delta)

        # flatten the delta
        flattened_delta = abs_delta.flatten()

        # calculate the mean and standard deviation of the delta
        mean = flattened_delta.mean() if flattened_delta.size > 0 else 0
        std = flattened_delta.std() if flattened_delta.size > 0 else 0

        # constant to calculate the depth change threshold
        k = 0.5

        # calculate the depth change threshold
        self.depth_change_threshold = mean + k * std

        # calculate the significant changes
        significant_changes = abs_delta[abs_delta > self.depth_change_threshold]

        # calculate the activity level
        self.activity_level = (
            np.mean(significant_changes) if significant_changes.size > 0 else 0
        )

    # update the background frame
    def update_background(self, current_frame):
        # get the roi box
        y1, y2 = self.roi_box[0]
        x1, x2 = self.roi_box[1]

        roi = current_frame[y1:y2, x1:x2]

        if self.background_frame is None:
            self.background_frame = roi.copy()

        # update the background frame every 4 frames
        elif roi.shape != self.background_frame.shape and self.frame_count % 4 == 0:
            roi = cv2.resize(
                roi,
                (self.background_frame.shape[1], self.background_frame.shape[0]),
            )
            self.background_frame = roi.copy()

    # calculate the respiratory rate
    def calc_rr(self):
        if self.peak_counter > 2 and self.frame_count > 0:
            self.rr = self.peak_counter / (self.frame_count / self.FPS) * 60

    # get the roi box
    def get_roi(self, keypoints):
        # indices for shoulders and hips: [5, 6, 11, 12]
        required_indices = [5, 6, 11, 12]

        # check that all required keypoints are present and non-zero
        if keypoints is None or keypoints.shape[0] < max(required_indices) + 1:
            self.roi_box = None
            return

        selected_kps = keypoints[required_indices, :2]

        # check for NaNs or very low confidence keypoints (zero or near-zero coordinates)
        if np.any(np.isnan(selected_kps)) or np.any(np.all(selected_kps == 0, axis=1)):
            self.roi_box = None
            return

        # proceed with roi calculation
        center_x = int(np.mean(selected_kps[:, 0]))
        shoulder_y = int(np.mean(selected_kps[[0, 1], 1]))
        hip_y = int(np.mean(selected_kps[[2, 3], 1]))
        chest_center_y = int(shoulder_y + (hip_y - shoulder_y) * 0.3)

        x1 = int(np.clip(center_x - self.BOX_WIDTH // 2, 0, 640 - 1))
        x2 = int(np.clip(center_x + self.BOX_WIDTH // 2, 0, 640 - 1))
        y1 = int(np.clip(chest_center_y - self.BOX_HEIGHT // 2, 0, 480 - 1))
        y2 = int(np.clip(chest_center_y + self.BOX_HEIGHT // 2, 0, 480 - 1))

        roi_box = ((y1, y2), (x1, x2))

        self.roi_box = roi_box
        self.roi_center_x = center_x
        self.roi_center_y = chest_center_y

    # smooth the signal to reduce noise
    def smooth_signal(self):
        signal = np.array(self.activity_history, dtype=np.float64)

        if len(signal) > 5:
            smoothed = uniform_filter1d(signal, size=20)
        else:
            smoothed = signal

        self.breathing_signal = smoothed

    # calculate the peak threshold
    def calc_peak_threshold(self):
        self.peak_threshold = (
            np.percentile(self.breathing_signal, 50)
            if len(self.breathing_signal) > 0
            else 1.0
        )

    # reset the model
    def reset(self):
        self.background_frame = None
        self.frame_count = 0
        self.activity_history = deque(maxlen=self.BUFFER_SIZE)
        self.peak_counter = 0
        self.above = False
        self.rr = None

    # count the peaks
    def count_peaks(self):
        if self.breathing_signal[-1] > self.peak_threshold and not self.above:
            self.peak_counter += 1
            self.above = True
        elif self.breathing_signal[-1] <= self.peak_threshold:
            self.above = False

    # process the frame
    def process_frame(self, depth_frame, keypoints):
        if keypoints is not None:
            self.get_roi(keypoints)

        if self.roi_box is not None:
            self.update_background(depth_frame)

            y1, y2 = self.roi_box[0]
            x1, x2 = self.roi_box[1]
            roi = depth_frame[y1:y2, x1:x2]
            self.calc_activity_level(roi)

            self.activity_history.append(self.activity_level)

            self.smooth_signal()

            self.calc_peak_threshold()

            self.count_peaks()

            self.calc_rr()

            self.frame_count += 1
