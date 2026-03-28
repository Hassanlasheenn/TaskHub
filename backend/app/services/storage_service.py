import os
import boto3
import uuid
import logging
import io
from botocore.exceptions import ClientError
from typing import Optional, Tuple
from PIL import Image, ImageOps

from .. import config

logger = logging.getLogger(__name__)

class S3StorageService:
    def __init__(self):
        # Use values from config.py which has already called load_dotenv()
        self.bucket_name = config.AWS_S3_BUCKET_NAME
        self.region = config.AWS_S3_REGION
        self.access_key = config.AWS_ACCESS_KEY_ID
        self.secret_key = config.AWS_SECRET_ACCESS_KEY
        
        if not all([self.bucket_name, self.access_key, self.secret_key]):
            logger.warning("⚠️ S3 credentials not fully configured. Falling back to local storage.")
            self.s3_client = None
        else:
            try:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    region_name=self.region
                )
            except Exception as e:
                logger.error(f"❌ Failed to initialize S3 client: {e}")
                self.s3_client = None

    def upload_profile_pic(self, file_content: bytes, filename: str) -> Optional[str]:
        """
        Uploads an image to S3 or local fallback.
        Returns the full URL or relative local path.
        """
        # Optimize image
        try:
            optimized_content = self._optimize_image(file_content)
        except Exception as e:
            logger.error(f"❌ Image optimization failed: {e}")
            optimized_content = file_content

        if self.s3_client:
            try:
                ext = os.path.splitext(filename)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
                    ext = '.jpg'
                
                unique_filename = f"profile_pics/{uuid.uuid4().hex}{ext}"
                
                # Upload to S3 with ACL fallback
                try:
                    self.s3_client.put_object(
                        Bucket=self.bucket_name,
                        Key=unique_filename,
                        Body=optimized_content,
                        ContentType='image/jpeg',
                        ACL='public-read'
                    )
                except Exception as e:
                    logger.warning(f"⚠️ Could not set ACL='public-read', retrying without ACL: {e}")
                    self.s3_client.put_object(
                        Bucket=self.bucket_name,
                        Key=unique_filename,
                        Body=optimized_content,
                        ContentType='image/jpeg'
                    )
                
                if self.region == 'us-east-1':
                    url = f"https://{self.bucket_name}.s3.amazonaws.com/{unique_filename}"
                else:
                    url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{unique_filename}"
                    
                logger.info(f"✅ Successfully uploaded profile pic to S3: {url}")
                return url
            except Exception as e:
                logger.error(f"❌ S3 Upload failed, falling back to local: {e}")

        # Fallback to local storage
        return self._save_local(optimized_content, filename, "profile_pics")

    def upload_file(self, file_content: bytes, filename: str, folder: str = "attachments", content_type: Optional[str] = None) -> Optional[str]:
        """
        Uploads a general file to S3 or local fallback.
        """
        if self.s3_client:
            try:
                ext = os.path.splitext(filename)[1].lower()
                unique_filename = f"{folder}/{uuid.uuid4().hex}{ext}"

                if not content_type:
                    content_type = 'application/octet-stream'
                    if ext in ['.jpg', '.jpeg', '.png', '.webp']: content_type = 'image/jpeg'
                    elif ext == '.pdf': content_type = 'application/pdf'
                    elif ext in ['.doc', '.docx']: content_type = 'application/msword'
                
                try:
                    self.s3_client.put_object(
                        Bucket=self.bucket_name,
                        Key=unique_filename,
                        Body=file_content,
                        ContentType=content_type,
                        ACL='public-read'
                    )
                except Exception as e:
                    logger.warning(f"⚠️ Could not set ACL='public-read' for file, retrying without ACL: {e}")
                    self.s3_client.put_object(
                        Bucket=self.bucket_name,
                        Key=unique_filename,
                        Body=file_content,
                        ContentType=content_type
                    )
                
                if self.region == 'us-east-1':
                    url = f"https://{self.bucket_name}.s3.amazonaws.com/{unique_filename}"
                else:
                    url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{unique_filename}"
                    
                logger.info(f"✅ Successfully uploaded file to S3: {url}")
                return url
            except Exception as e:
                logger.error(f"❌ S3 File upload failed, falling back to local: {e}")

        # Fallback to local storage
        return self._save_local(file_content, filename, folder)

    def delete_file(self, file_url: str) -> bool:
        """Deletes a file from S3 or local storage."""
        if not file_url:
            return False
            
        if "s3.amazonaws.com" in file_url:
            if not self.s3_client: return False
            try:
                if self.bucket_name in file_url:
                    key = file_url.split(".amazonaws.com/")[-1]
                    self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
                    logger.info(f"🗑️ Deleted S3 object: {key}")
                    return True
                return False
            except Exception as e:
                logger.error(f"❌ S3 Delete failed: {e}")
                return False
        
        # Local file deletion
        if file_url.startswith("/static/"):
            try:
                relative_path = file_url.replace("/static/", "")
                file_path = os.path.join(os.getcwd(), "static", relative_path)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"🗑️ Deleted local file: {file_path}")
                    return True
                return False
            except Exception as e:
                logger.error(f"❌ Local delete failed: {e}")
                return False
        
        return False

    def _save_local(self, file_content: bytes, filename: str, folder: str) -> Optional[str]:
        """Internal helper to save file to local static directory."""
        try:
            static_dir = os.path.join(os.getcwd(), "static", folder)
            os.makedirs(static_dir, exist_ok=True)
            
            ext = os.path.splitext(filename)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(static_dir, unique_filename)
            
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            # Return relative URL starting with /static/
            url = f"/static/{folder}/{unique_filename}"
            logger.info(f"✅ Successfully saved file locally: {url}")
            return url
        except Exception as e:
            logger.error(f"❌ Local storage failed: {e}")
            return None

    def _optimize_image(self, file_content: bytes) -> bytes:
        """Internal helper to resize and compress image before upload."""
        img = Image.open(io.BytesIO(file_content))
        
        try:
            img = ImageOps.exif_transpose(img)
        except Exception as e:
            logger.warning(f"Could not transpose image EXIF: {e}")

        if img.mode != "RGB":
            img = img.convert("RGB")
        
        img.thumbnail((150, 150), Image.Resampling.LANCZOS)
        
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85, optimize=True)
        return buffer.getvalue()
