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
    inline = audio.parse_turns("여자: 안녕하세요. 남자: 반갑습니다.", False)
    assert inline == [("female", "안녕하세요."), ("male", "반갑습니다.")]
    three = audio.parse_turns("여자: 하나.\n남자: 둘.\n여자: 셋.", False)
    assert [voice for voice, _ in three] == ["female", "male", "female"]

def test_voice_metadata():
    assert audio.parse_turns("남자: 학교에 가요.", False) == [("male", "학교에 가요.")]
    assert audio.parse_turns("여자: 어디에 가요?", True) == [("female", "어디에 가요?")]
    assert audio.preferred_male({"file":"01_HOC_TIENG_HAN/CAP_1/BAI_04/01_TU_VUNG/v0002_test.mp3", "text":"학교", "male":"False"})
    assert not audio.preferred_male({"file":"01_HOC_TIENG_HAN/CAP_1/BAI_04/01_TU_VUNG/v0001_test.mp3", "text":"학교", "male":"False"})

def test_numbering():
    assert audio.number_of({"file":"03_TOPIK/TOPIK_1/V11/v11-1-listening-020_abc.mp3"}) == 20
    assert audio.is_exam({"file":"03_TOPIK/TOPIK_1/V11/v11-1-listening-020_abc.mp3"})
    assert not audio.is_exam({"file":"01_HOC_TIENG_HAN/lesson.mp3"})

def test_approved_exam_cadence():
    assert audio.sino_korean_number(1) == "일"
    assert audio.sino_korean_number(12) == "십이"
    assert audio.sino_korean_number(103) == "백삼"
    voices = [("female", "어디에 가요?"), ("male", "학교에 가요.")]
    plan = audio.approved_exam_plan(voices, 12)
    assert plan[0] == ("female", "십이 번", 3.0)
    assert plan[1] == ("female", "어디에 가요?", 0.55)
    assert plan[2] == ("male", "학교에 가요.", 3.0)
    assert plan[3] == ("female", "다시 들으십시오.", 0.5)
    assert plan[4] == ("female", "어디에 가요?", 0.55)
    assert plan[5] == ("male", "학교에 가요.", 4.0)
    assert [t[0] for t in plan].count("male") == 2
    assert all("남자:" not in item[1] and "여자:" not in item[1] for item in plan)


if __name__ == "__main__":
    test_roles()
    test_voice_metadata()
    test_numbering()
    test_approved_exam_cadence()
    print("MR LEE audio unit tests passed")
