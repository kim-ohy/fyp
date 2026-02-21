"""
utils/pose.py
This file contains the PoseEstimationModel class, which is used to estimate the pose of the person in the frame.
It uses YOLOv11-pose to detect the person and the keypoints.
"""

import cv2
import numpy as np
from ultralytics import YOLO


class PoseEstimationModel:
    def __init__(self):
        self.model = YOLO("./models/pose_estimation_model/weights/best.pt")
        self.prev_keypoints = None
        self.current_keypoints = None

    # run the model on the frame to get the keypoints
    def predict_keypoints(self, frame: np.ndarray):
        results = self.model.predict(frame, conf=0.65, verbose=False)
        return results[0]

    # preprocess the keypoints
    def preprocess_keypoints(self, result):
        keypoints_diff = []
        keypoints_xy = []

        if (
            result.keypoints is not None
            and result.boxes is not None
            and len(result.boxes) > 0
            and result.orig_shape is not None
            and result.keypoints.data.shape[1] == 17
        ):
            self.current_keypoints = result.keypoints.data[0].cpu().numpy()

            # get the height and width of the image
            img_h, img_w = result.orig_shape[:2]

            # get the bounding box
            bbox = result.boxes.xyxy[0].cpu().numpy()

            # get the width and height of the bounding box
            w1, h1, w2, h2 = bbox
            bbox_width = max(w2 - w1, 1e-6)
            bbox_height = max(h2 - h1, 1e-6)

            # extract normalized keypoints
            for i in range(5, 17):
                x, y, _ = self.current_keypoints[i]

                # normalize coordinates
                norm_x = x / img_w if img_w > 0 else 0.0
                norm_y = y / img_h if img_h > 0 else 0.0

                keypoints_xy.append(norm_x)
                keypoints_xy.append(norm_y)

            # calculate keypoint differences
            if self.prev_keypoints is not None and self.prev_keypoints.shape == (17, 3):
                for i in range(5, 17):
                    x1, y1, _ = self.prev_keypoints[i]
                    x2, y2, _ = self.current_keypoints[i]

                    if x2 == 0 and y2 == 0:
                        dx, dy = 0.0, 0.0
                        keypoints_diff.extend((dx, dy))
                    else:
                        # normalize the keypoint differences
                        dx = (x2 - x1) / bbox_width
                        dy = (y2 - y1) / bbox_height

                        keypoints_diff.extend((dx, dy))

        else:
            # fill with zeros if no valid keypoints
            for i in range(5, 17):
                dx, dy = 0.0, 0.0
                keypoints_diff.extend((dx, dy))
                keypoints_xy.extend((0.0, 0.0))

        # update the previous keypoints
        self.prev_keypoints = self.current_keypoints

        # convert to numpy array
        keypoints_xy = np.array(keypoints_xy, dtype=np.float32)

        return keypoints_diff, keypoints_xy

    # get the keypoints and annotated frame
    def get_results(self, frame: np.ndarray):
        result = self.predict_keypoints(frame)

        keypoints_diff, keypoints_xy = self.preprocess_keypoints(result)

        return (
            result,
            result.keypoints.has_visible,
            keypoints_diff,
            keypoints_xy,
        )
