"""
main.py
This file contains the main function for the fall detection system.
It initializes the database, kinect, and depth sequence,
and then enters a main loop where it processes depth frames,
performs pose estimation, fall detection, and rr monitoring,
and saves fall footage and alerts if necessary.

The system is designed to be run with a Microsoft Kinect v1 sensor.

It uses the following models:
- PoseEstimationModel: to estimate the pose of the person in the frame
- FallDetectionModel: to detect falls
- RRMonitoringModel: to monitor the rr of the person
- Camera: to get the depth frame from the kinect sensor
- Database: to save the fall footage and alerts to the database
- cv2: to display the annotated frame
- numpy: to process the depth frame
- datetime: to get the current time
- os: to check if the file exists
- time: to wait for the file to be saved
"""

from utils.camera import Camera
from utils.pose import PoseEstimationModel
from utils.fall import FallDetectionModel
from utils.rr import RRMonitoringModel
import cv2
import numpy as np
from datetime import datetime
from utils.database import Database
import os
import time


# initialize video writer to save fall clip when a fall occurs
def init_video_writer(depth_3channel_frame, filename):

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    frame_height, frame_width = depth_3channel_frame.shape[:2]

    filepath = f"clips/{filename}"

    return cv2.VideoWriter(filepath, fourcc, 30.0, (frame_width, frame_height))


# save fall footage to video file
def save_fall_footage(depth_sequence, video_writer):
    for frame in depth_sequence:
        video_writer.write(frame)
    video_writer.release()


# save fall and alert to database
def save_fall_and_alert(filename: str, database):
    timeout = 2
    start_time = time.time()
    while not (
        os.path.exists(f"clips/{filename}") and os.path.getsize(f"clips/{filename}") > 0
    ):
        if time.time() - start_time > timeout:
            raise FileNotFoundError(
                f"File {filename} not found or empty after waiting."
            )
        time.sleep(0.05)

    database.upload_file(filename)
    response = database.insert_alert(filename, "falls")
    database.send_alert_notification(response)


# save rr and alert to database
def save_rr_and_alert(rr, database):
    if rr is not None:
        rr = int(rr)
        if rr > 12 and rr < 20:
            database.update_subject_status(status="Normal", rr=rr)
        else:
            response = database.insert_alert(rr=rr, alert_type="unusualRR")
            database.send_alert_notification(response)
            database.update_subject_status(status="Critical", rr=rr)
    else:
        database.update_subject_status(status="N/A", rr=0)


# evaluate fall result by checking if the fall detection model has detected a fall for 5 consecutive frames
def evaluate_fall_result(fall_result_sequence, fall_detection_model):
    if all(fall_result_sequence):
        fall_detection_model.reset_sequence()
        return True
    else:
        return False


# initialize fall result sequence to check if the fall detection model has detected a fall for 5 consecutive frames
def init_fall_result_sequence():
    max_fall_result_sequence_length = 5
    return [False] * max_fall_result_sequence_length


# main function
def main():
    # initialize database, kinect, and depth sequence
    database = Database()
    kinect = Camera()
    initial_depth = kinect.start()

    if initial_depth is not None:
        database.update_camera_status(True)
        database.send_camera_notification(True)

    # initialize depth sequence and frame count
    depth_sequence = []
    max_depth_sequence_length = 200
    frame_count = 0

    # initialize fall result sequence
    fall_result_sequence = init_fall_result_sequence()

    # initialize pose estimation, fall detection, and rr monitoring models
    pose_estimation_model = PoseEstimationModel()
    fall_detection_model = FallDetectionModel()
    rr_monitor = RRMonitoringModel()
    fall_detection_model.set_mode("kp")

    # main loop
    while True:
        # get depth frame
        depth_3channel_frame, depth_frame = kinect.get_preprocessed_depth()

        # ensure that everything is run only when depth frame is not None
        if depth_3channel_frame is not None:
            # get pose estimation results
            keypoints, person_detected, keypoints_diff, keypoints_xy = (
                pose_estimation_model.get_results(depth_3channel_frame)
            )

            # start rr monitoring
            rr_monitor.process_frame(
                depth_frame, keypoints.keypoints.data[0].cpu().numpy()
            )

            # reset rr monitoring if no person is detected
            if not person_detected:
                rr_monitor.reset()

            # add keypoints to fall detection model
            if keypoints is not None and len(keypoints) > 0:
                annotated_frame = keypoints.plot()
                fall_detection_model.add_feature(keypoints_diff, keypoints_xy)
            else:
                annotated_frame = depth_3channel_frame.copy()

            if len(depth_sequence) < max_depth_sequence_length:
                depth_sequence.append(depth_3channel_frame)
            else:
                depth_sequence.pop(0)
                depth_sequence.append(depth_3channel_frame)

            # get fall detection result
            fall_detection_result = fall_detection_model.predict_sequence()

            # update fall result sequence
            if (
                fall_detection_result is not None
                and fall_detection_result["is_fall"]
                and fall_detection_result["confidence"] > 0.75
            ):
                fall_result_sequence.pop(0)
                fall_result_sequence.append(fall_detection_result["is_fall"])

            fall_detected = evaluate_fall_result(
                fall_result_sequence, fall_detection_model
            )

            # save fall footage and alert if fall is detected
            if fall_detected:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"fall_detection_{timestamp}.mp4"

                video_writer = init_video_writer(initial_depth, filename)
                save_fall_footage(depth_sequence, video_writer)
                save_fall_and_alert(filename, database)

                fall_result_sequence = init_fall_result_sequence()

            # show annotated frame
            cv2.imshow("Annotated Frame", annotated_frame)

            # update frame count
            frame_count += 1

            # save rr every 1800 frames, which is every minute
            if frame_count % 1800 == 0:
                save_rr_and_alert(rr_monitor.rr, database)

            # break loop and end if q is pressed
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        else:
            break

    # clean up
    kinect.stop()

    # update camera status and send notification
    database.update_camera_status(False)
    database.send_camera_notification(False)

    save_rr_and_alert(None, database)

    # destroy all windows
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
