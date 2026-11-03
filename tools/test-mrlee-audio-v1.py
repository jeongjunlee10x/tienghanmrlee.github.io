"""Standard-library regression checks for the MR LEE dual-voice audio builder."""
import importlib.util
from pathlib import Path

source = Path(__file__).with_name("mrlee-audio-v1.py")
spec = importlib.util.spec_from_file_location("mrlee_audio", source)
audio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audio)

def test_roles():
    turns = audio.parse_turns("여자: 안녕하세요.\n남자: 네, 안녕하세요.", False)
    assert turns == [("female", "안녕하세요."), ("male", "네, 안녕하세요.")]
    assert all("여자:" not in t and "남자:" not in t for _, t in turns)

def test_voice_metadata():
    assert audio.parse_turns("남자: 학교에 가요.", False) == [("male", "학교에 가요.")]
    assert audio.parse_turns("여자: 어디에 가요?", True) == [("female", "어디에 가요?")]
    assert audio.preferred_male({"file":"01_HOC_TIENG_HAN/CAP_1/BAI_04/01_TU_VUNG/v0002_test.mp3", "text":"학교", "male":"False"})
    assert not audio.preferred_male({"file":"01_HOC_TIENG_HAN/CAP_1/BAI_04/01_TU_VUNG/v0001_test.mp3", "text":"학교", "male":"False"})

def test_numbering():
    assert audio.number_of({"file":"03_TOPIK/TOPIK_1/V11/v11-1-listening-020_abc.mp3"}) == 20
    assert audio.is_exam({"file":"03_TOPIK/TOPIK_1/V11/v11-1-listening-020_abc.mp3"})
    assert not audio.is_exam({"file":"01_HOC_TIENG_HAN/lesson.mp3"})

if __name__ == "__main__":
    test_roles()
    test_voice_metadata()
    test_numbering()
    print("MR LEE audio unit tests passed")
