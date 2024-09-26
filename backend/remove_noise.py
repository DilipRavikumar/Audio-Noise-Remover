import sys
import os
import librosa
import noisereduce as nr
import soundfile as sf

def remove_noise(audio_path, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    y, sr = librosa.load(audio_path, sr=None)
    y_denoised = nr.reduce_noise(y=y, sr=sr)
    sf.write(output_path, y_denoised, sr)
    return output_path

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python remove_noise.py <audio_file_path> <output_file_path>")
        sys.exit(1)

    audio_file_path = sys.argv[1]
    output_file_path = sys.argv[2]
    processed_file = remove_noise(audio_file_path, output_file_path)
    print(processed_file)
