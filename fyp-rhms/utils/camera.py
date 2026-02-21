"""
utils/camera.py
This file contains the Camera class, which is used to get the depth frame from the kinect camera.
"""

import freenect
import cv2
import numpy as np


class Camera:
    def __init__(self):
        self.depth = None
        self.depth_3channel = None
        self._running = False

    # start the camera
    def start(self):
        try:
            # get initial frame
            self.depth = freenect.sync_get_depth()[0]

            # initialize the camera connection
            self._running = True
            print("Camera started successfully")

        except Exception:
            print("Error starting camera. Please check if the camera is connected.")

        return self.depth

    # stop the camera
    def stop(self):
        # stop the camera and clean up
        self._running = False
        freenect.sync_stop()

    # get the depth frame
    def get_depth(self):
        # get a new depth frame from the camera
        if not self._running:
            return None
        try:
            self.depth = freenect.sync_get_depth()[0]
            return self.depth
        except Exception as e:
            print(f"Error getting depth frame: {str(e)}")
            return None

    # preprocess the depth frame
    def preprocess_depth(self):
        try:
            # normalize depth to 0-255 range
            depth_normalized = cv2.normalize(
                self.depth.astype(np.uint8), None, 0, 255, cv2.NORM_MINMAX
            )

            # convert to 3-channel image
            self.depth_3channel = cv2.cvtColor(depth_normalized, cv2.COLOR_GRAY2BGR)
        except Exception as e:
            print(f"Error preprocessing depth: {str(e)}")
            self.depth_3channel = None

    # get the preprocessed depth frame
    def get_preprocessed_depth(self):
        self.get_depth()
        self.preprocess_depth()
        return self.depth_3channel, self.depth
