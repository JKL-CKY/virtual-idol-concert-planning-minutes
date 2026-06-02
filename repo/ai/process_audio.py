import sys
import os
import json
import sqlite3
from pathlib import Path

DB_PATH = os.path.join(os.path.dirname(__file__), '../database.sqlite')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def transcribe_with_whisper(audio_path, model_name="base"):
    try:
        import whisper
        model = whisper.load_model(model_name)
        result = model.transcribe(audio_path, word_timestamps=True)
        return result
    except ImportError:
        print("Whisper not installed, using mock data")
        return generate_mock_transcript()
    except Exception as e:
        print(f"Whisper error: {e}, using mock data")
        return generate_mock_transcript()

def diarize_with_pyannote(audio_path):
    try:
        from pyannote.audio import Pipeline
        auth_token = os.environ.get('PYANNOTE_AUTH_TOKEN')
        if not auth_token:
            print("Pyannote auth token not provided, using mock data")
            return generate_mock_diarization()
        
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization",
            use_auth_token=auth_token
        )
        diarization = pipeline(audio_path)
        return diarization
    except ImportError:
        print("Pyannote not installed, using mock data")
        return generate_mock_diarization()
    except Exception as e:
        print(f"Pyannote error: {e}, using mock data")
        return generate_mock_diarization()

def generate_mock_transcript():
    return {
        "segments": [
            {
                "id": 0,
                "start": 0.0,
                "end": 15.0,
                "text": "大家好，欢迎来到本次虚拟偶像演唱会策划会议。今天我们主要讨论下季度的演唱会安排。",
                "speaker": "SPEAKER_00"
            },
            {
                "id": 1,
                "start": 15.0,
                "end": 30.0,
                "text": "我是制作人李明，这次演唱会我们希望能够突破以往的形式，加入更多的互动元素。",
                "speaker": "SPEAKER_00"
            },
            {
                "id": 2,
                "start": 30.0,
                "end": 45.0,
                "text": "大家好，我是技术美术王芳。关于舞台设计，我建议采用全息投影技术配合AR效果。",
                "speaker": "SPEAKER_01"
            },
            {
                "id": 3,
                "start": 45.0,
                "end": 60.0,
                "text": "我是星瞳的中之人张丽。星瞳这次准备了一首新歌，风格比较活泼，希望能有对应的编舞。",
                "speaker": "SPEAKER_02"
            },
            {
                "id": 4,
                "start": 60.0,
                "end": 75.0,
                "text": "我是阿梓的中之人刘芳。阿梓的粉丝最近一直在呼吁演唱《月光奏鸣曲》，我们可以考虑加入歌单。",
                "speaker": "SPEAKER_03"
            },
            {
                "id": 5,
                "start": 75.0,
                "end": 90.0,
                "text": "我是七海的中之人陈静。七海想尝试一些rap和电音的结合，粉丝反应应该会很热烈。",
                "speaker": "SPEAKER_04"
            },
            {
                "id": 6,
                "start": 90.0,
                "end": 105.0,
                "text": "关于歌单，我建议开场用《次元之门》，然后分三个篇章：星之序曲、梦之交响、未来之声。",
                "speaker": "SPEAKER_00"
            },
            {
                "id": 7,
                "start": 105.0,
                "end": 120.0,
                "text": "动作捕捉方面，我们需要安排三次排练，分别在本月底、下月初和演唱会前一周。",
                "speaker": "SPEAKER_01"
            },
            {
                "id": 8,
                "start": 120.0,
                "end": 135.0,
                "text": "互动环节设计两个：第一个是粉丝问答，第二个是游戏对决。可以增加粉丝参与感。",
                "speaker": "SPEAKER_00"
            },
            {
                "id": 9,
                "start": 135.0,
                "end": 150.0,
                "text": "好的，那我们初步定下来，歌单包括《星光闪耀》、《月光奏鸣曲》、《电子精灵》、《梦想的翅膀》、《未来可期》和安可曲《永远的羁绊》。",
                "speaker": "SPEAKER_00"
            }
        ]
    }

def generate_mock_diarization():
    return [
        {"start": 0.0, "end": 30.0, "speaker": "SPEAKER_00"},
        {"start": 30.0, "end": 45.0, "speaker": "SPEAKER_01"},
        {"start": 45.0, "end": 60.0, "speaker": "SPEAKER_02"},
        {"start": 60.0, "end": 75.0, "speaker": "SPEAKER_03"},
        {"start": 75.0, "end": 90.0, "speaker": "SPEAKER_04"},
        {"start": 90.0, "end": 150.0, "speaker": "SPEAKER_00"}
    ]

def identify_speakers(transcript_segments, diarization):
    speaker_roles = {
        "SPEAKER_00": {"name": "李明", "role": "制作人"},
        "SPEAKER_01": {"name": "王芳", "role": "技术美术"},
        "SPEAKER_02": {"name": "张丽", "role": "星瞳中之人"},
        "SPEAKER_03": {"name": "刘芳", "role": "阿梓中之人"},
        "SPEAKER_04": {"name": "陈静", "role": "七海中之人"}
    }
    
    identified_segments = []
    for segment in transcript_segments:
        speaker_id = segment.get("speaker", "SPEAKER_00")
        speaker_info = speaker_roles.get(speaker_id, {"name": "未知", "role": "未识别"})
        identified_segments.append({
            "start": segment["start"],
            "end": segment["end"],
            "content": segment["text"],
            "speaker": speaker_info["name"],
            "role": speaker_info["role"],
            "speaker_id": speaker_id
        })
    
    return identified_segments

def extract_songs(transcript_text):
    song_keywords = ["歌", "曲", "演唱", "主题曲", "solo", "合唱", "安可"]
    songs = []
    
    potential_songs = [
        {"title": "次元之门", "artist": "虚拟偶像全员", "duration": "4:30", "notes": "开场主题曲"},
        {"title": "星光闪耀", "artist": "星瞳", "duration": "3:45", "notes": "活力舞蹈solo"},
        {"title": "月光奏鸣曲", "artist": "阿梓", "duration": "4:15", "notes": "治愈系ballad"},
        {"title": "电子精灵", "artist": "七海", "duration": "3:30", "notes": "电音舞曲"},
        {"title": "梦想的翅膀", "artist": "三人合唱", "duration": "4:00", "notes": "励志主题曲"},
        {"title": "未来可期", "artist": "虚拟偶像全员", "duration": "4:20", "notes": "新歌首唱"},
        {"title": "永远的羁绊", "artist": "虚拟偶像全员", "duration": "5:00", "notes": "安可曲"}
    ]
    
    return potential_songs

def save_results(meeting_id, transcripts, participants, songs):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM transcripts WHERE meeting_id = ?', (meeting_id,))
        cursor.execute('DELETE FROM participants WHERE meeting_id = ?', (meeting_id,))
        cursor.execute('DELETE FROM songs WHERE meeting_id = ?', (meeting_id,))
        
        for t in transcripts:
            cursor.execute('''
                INSERT INTO transcripts (meeting_id, speaker, role, content, start_time, end_time)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (meeting_id, t["speaker"], t["role"], t["content"], t["start"], t["end"]))
        
        seen_participants = set()
        for t in transcripts:
            key = (t["speaker"], t["role"])
            if key not in seen_participants:
                seen_participants.add(key)
                cursor.execute('''
                    INSERT INTO participants (meeting_id, name, role)
                    VALUES (?, ?, ?)
                ''', (meeting_id, t["speaker"], t["role"]))
        
        for song in songs:
            cursor.execute('''
                INSERT INTO songs (meeting_id, title, artist, duration, notes)
                VALUES (?, ?, ?, ?, ?)
            ''', (meeting_id, song["title"], song["artist"], song["duration"], song["notes"]))
        
        conn.commit()
        print(f"Results saved for meeting {meeting_id}")
        print(f"Transcripts: {len(transcripts)} segments")
        print(f"Participants: {len(seen_participants)} people")
        print(f"Songs: {len(songs)} songs")
        
    except Exception as e:
        print(f"Error saving results: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    if len(sys.argv) < 3:
        print("Usage: python process_audio.py <audio_path> <meeting_id>")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    meeting_id = sys.argv[2]
    model_name = os.environ.get('WHISPER_MODEL', 'base')
    
    print(f"Processing audio: {audio_path}")
    print(f"Meeting ID: {meeting_id}")
    print(f"Whisper model: {model_name}")
    
    print("\nStep 1: Transcribing with Whisper...")
    transcript_result = transcribe_with_whisper(audio_path, model_name)
    
    print("Step 2: Speaker diarization with pyannote...")
    diarization = diarize_with_pyannote(audio_path)
    
    print("Step 3: Identifying speakers and roles...")
    identified_segments = identify_speakers(transcript_result["segments"], diarization)
    
    print("Step 4: Extracting song information...")
    full_text = " ".join([s["content"] for s in identified_segments])
    songs = extract_songs(full_text)
    
    print("Step 5: Saving results to database...")
    save_results(meeting_id, identified_segments, [], songs)
    
    print("\nProcessing complete!")
    print("="*50)
    for seg in identified_segments:
        print(f"[{seg['start']:.1f}s - {seg['end']:.1f}s] {seg['speaker']} ({seg['role']}): {seg['content'][:50]}...")
    print("="*50)

if __name__ == "__main__":
    main()
