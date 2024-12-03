from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

# Define the upload directory
UPLOAD_DIR = Path('./uploads')  # Ensure it resolves correctly
UPLOAD_DIR.mkdir(exist_ok=True)  # Create the directory if it doesn't exist

app = FastAPI()

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # Allow all origins (modify for specific origins in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/uploadfile')
async def create_upload_file(file_upload: UploadFile):
    try:
        # Read the uploaded file data
        data = await file_upload.read()

        # Define the save path
        save_to = UPLOAD_DIR / file_upload.filename

        # Save the file
        with open(save_to, 'wb') as f:
            f.write(data)

        return {"message": "File uploaded successfully", "filename": file_upload.filename}

    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}
