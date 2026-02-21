"""
utils/database.py
This file contains the Database class, which is used to interact with the Supabase database.
It is used to upload fall footage and alerts to the database,
as well as to update the camera status and subject status.
"""

from supabase import create_client, Client
from dotenv import load_dotenv
import os


class Database:
    def __init__(self):
        # load environment variables
        load_dotenv()

        # initialize supabase client
        self.url: str = os.environ.get("SUPABASE_URL")
        self.key: str = os.environ.get("SUPABASE_KEY")

        self.supabase: Client = create_client(self.url, self.key)

        # initialize bucket name
        self.bucket_name: str = "fall-clips"

    # upload fall footage to the database
    def upload_file(self, file_path: str):
        response = self.supabase.storage.from_(self.bucket_name).upload(
            file=f"clips/{file_path}",
            path=file_path,
            file_options={"upsert": "true", "content-type": "video/mp4"},
        )

        print(response)

    # insert alert into the database
    def insert_alert(
        self, video_url: str = None, alert_type: str = None, rr: int = None
    ):
        response = (
            self.supabase.table("alerts")
            .insert(
                {
                    "video_url": video_url,
                    "type": alert_type,
                    "rr": rr,
                }
            )
            .execute()
        )

        return response

    # send alert notification to user device
    def send_alert_notification(self, response):
        response = self.supabase.functions.invoke(
            "notify-alert",
            invoke_options={
                "body": {"data": response.data[0]},
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {os.environ.get('SUPABASE_KEY')}",
                },
            },
        )

    # update camera status in the database
    def update_camera_status(self, value: bool):
        response = (
            self.supabase.table("camera_status")
            .update(
                {
                    "status": value,
                }
            )
            .eq("id", 1)
            .execute()
        )

        return response

    # send camera notification to user device
    def send_camera_notification(self, value: bool):
        response = self.supabase.functions.invoke(
            "notify-camera",
            invoke_options={
                "body": {"status": value},
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {os.environ.get('SUPABASE_KEY')}",
                },
            },
        )

        print(response)

    # update subject status in the database
    def update_subject_status(self, status: str, rr: int):
        response = (
            self.supabase.table("subject_status")
            .update({"status": status, "rr": rr})
            .eq("id", 1)
            .execute()
        )

        return response
