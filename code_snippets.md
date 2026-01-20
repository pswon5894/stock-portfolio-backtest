# 코드 스니펫 모음

이전 대화에서 제공된 다양한 코드 스니펫들입니다.

---

### 1. Python: 텍스트 정규화 클래스 (한글)

숫자와 영문자를 한글 발음으로 변환하는 Python 클래스입니다.

```python
import re

class KoreanCleaner:
    @classmethod
    def _normalize_numbers(cls, text):
        number_to_kor = {
            "0": "영",
            "1": "일",
            "2": "이",
            "3": "삼",
            "4": "사",
            "5": "오",
            "6": "육",
            "7": "칠",
            "8": "팔",
            "9": "구",
        }
        new_text = "".join(
            number_to_kor[char] if char in number_to_kor.keys() else char
            for char in text
        )
        return new_text

    @classmethod
    def _normalize_english_text(cls, text):
        upper_alphabet_to_kor = {
            "A": "에이",
            "B": "비",
            "C": "씨",
            "D": "디",
            "E": "이",
            "F": "에프",
            "G": "지",
            "H": "에이치",
            "I": "아이",
            "J": "제이",
            "K": "케이",
            "L": "엘",
            "M": "엠",
            "N": "엔",
            "O": "오",
            "P": "피",
            "Q": "큐",
            "R": "알",
            "S": "에스",
            "T": "티",
            "U": "유",
            "V": "브이",
            "W": "더블유",
            "X": "엑스",
            "Y": "와이",
            "Z": "지",
        }
        new_text = re.sub("[a-z]+", lambda x: str.upper(x.group()), text)
        new_text = "".join(
            (
                upper_alphabet_to_kor[char]
                if char in upper_alphabet_to_kor.keys()
                else char
            )
            for char in new_text
        )

        return new_text

    @classmethod
    def normalize_text(cls, text):
        # stage 0 : text strip
        text = text.strip()

        # stage 1 : normalize numbers
        text = cls._normalize_numbers(text)

        # stage 2 : normalize english text
        text = cls._normalize_english_text(text)
        return text
```

---


### 2. Python: 특수 문자 교체 (중국어)

각주 문자를 중국어 단어로 교체하는 Python 함수입니다.

```python
def replace_corner_mark(text):
    text = text.replace("²", "平方")
    text = text.replace("³", "立方")
    return text
```

---


### 3. Python: Gradio 데모 UI

Gradio 라이브러리를 사용하여 음성 합성 모델의 웹 UI를 생성하는 Python 코드입니다.

```python
import gradio as gr

def launch_demo(args):
    # 选项列表
    emotion_options = ["高兴1", "高兴2", "生气1", "生气2", "悲伤1", "撒娇1"]
    language_options = ["中文", "英文", "韩语", "日语", "四川话", "粤语", "广东话"]
    speed_options = ["慢速1", "慢速2", "快速1", "快速2"]
    speaker_options = ["Tingting"]
    # Gradio 界面
    with gr.Blocks() as demo:
        gr.Markdown("## 🎙️ Step-Audio-TTS-3B Demo")

        # 普通语音合成
        with gr.Tab("Common TTS (普通语音合成)"):
            text_input = gr.Textbox(
                label="Input Text (输入文本)",
            )
            speaker_input = gr.Dropdown(
                speaker_options,
                label="Speaker Selection (音色选择)",
            )
            emotion_input = gr.Dropdown(
                emotion_options,
                label="Emotion Style (情感风格)",
                allow_custom_value=True,
                interactive=True,
            )
            language_input = gr.Dropdown(
                language_options,
                label="Language/Dialect (语言/方言)",
                allow_custom_value=True,
                interactive=True,
            )
            speed_input = gr.Dropdown(
                speed_options,
                label="Speech Rate (语速调节)",
                allow_custom_value=True,
                interactive=True,
            )
            submit_btn = gr.Button("🔊 Generate Speech (生成语音)")
            output_audio = gr.Audio(
                label="Output Audio (合成语音)",
                interactive=False,
            )

            submit_btn.click(
                # tts_common is not defined in the snippet
                # tts_common, 
                inputs=[
                    text_input,
                    speaker_input,
                    emotion_input,
                    language_input,
                    speed_input,
                ],
                outputs=output_audio,
            )

        # RAP / 哼唱模式
        with gr.Tab("RAP/Humming Mode (RAP/哼唱模式)"):
            text_input_rap = gr.Textbox(
                label="Lyrics Input (歌词输入)",
            )
            speaker_input = gr.Dropdown(
                speaker_options,
                label="Speaker Selection (音色选择)",
            )
            mode_input = gr.Radio(
                ["RAP", "Humming (哼唱)"],
                value="RAP",
                label="Generation Mode (生成模式)",
            )
            submit_btn_rap = gr.Button("🎤 Generate Performance (生成演绎)")
            output_audio_rap = gr.Audio(
                label="Performance Audio (演绎音频)", interactive=False
            )
            submit_btn_rap.click(
                # tts_music is not defined in the snippet
                # tts_music,
                inputs=[text_input_rap, speaker_input, mode_input],
                outputs=output_audio_rap,
            )

        with gr.Tab("Voice Clone (语音克隆)"):
            text_input_clone = gr.Textbox(
                label="Target Text (目标文本)",
                placeholder="Text to be synthesized with cloned voice (待克隆语音合成的文本)",
            )
            audio_input = gr.File(
                label="Reference Audio Upload (参考音频上传)",
            )
            speaker_prompt = gr.Textbox(
                label="Exact text from reference audio (输入参考音频的准确文本)",
            )
            emotion_input = gr.Dropdown(
                emotion_options,
                label="Emotion Style (情感风格)",
                allow_custom_value=True,
                interactive=True,
            )
            language_input = gr.Dropdown(
                language_options,
                label="Language/Dialect (语言/方言)",
                allow_custom_value=True,
                interactive=True,
            )
            speed_input = gr.Dropdown(
                speed_options,
                label="Speech Rate (语速调节)",
                allow_custom_value=True,
                interactive=True,
            )
            submit_btn_clone = gr.Button("🗣️ Synthesize Cloned Speech (合成克隆语音)")
            output_audio_clone = gr.Audio(
                label="Cloned Speech Output (克隆语音输出)",
                interactive=False,
            )
            submit_btn_clone.click(
                # tts_clone is not defined in the snippet
                # tts_clone,
                inputs=[
                    text_input_clone,
                    audio_input,
                    speaker_prompt,
                    emotion_input,
                    language_input,
                    speed_input,
                ],
                outputs=output_audio_clone,
            )

    # 启动 Gradio demo
    # The 'args' object is not defined in the snippet
    # demo.queue().launch(server_name=args.server_name, server_port=args.server_port)
```

---


### 4. Python: 콘솔 로고 출력

콘솔에 ASCII 아트로 만든 로고를 출력하는 Python 함수입니다.

```python
MAGENTA = "" # Placeholder for ANSI escape code
BOLD = "" # Placeholder for ANSI escape code
RESET = "" # Placeholder for ANSI escape code

def display_magentic_ui_logo():
    """Display the MAGENTIC UI entry text."""

    magentic_logo = f"{MAGENTA}{BOLD}
╔═══════════════════════════════════════════════════════════════════╗
║    __  __    _    ____ _____ _   _ _____ ___ ____    _   _ ___    ║
║   |  \/  |  / \  / ___| ____| \ | |_   _|_ _/ ___|  | | | |_ _|   ║
║   | |\/| | / _ \| |  _|  _| |  \| | | |  | | |      | | | || |    ║
║   | |  | |/ ___ \ |_| | |___| |\  | | |  | | |___   | |_| || |    ║
║   |_|  |_/_/   \_\____|_____|_| \_| |_| |___\____|   \___/|___|   ║  
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝                                                          
    {RESET} """

    print(magentic_logo)
```

---


### 5. React (JSX): 마크다운 렌더러 컴포넌트

`ReactMD` 라이브러리를 사용하여 마크다운 콘텐츠를 렌더링하는 React 컴포넌트 예시입니다.

```jsx
// CodeBlock is not defined in the snippet
// import CodeBlock from "./CodeBlock"; 
import ReactMD from "react-markdown";

function MyComponent({ className, markdownContent }) {
  return (
    <ReactMD
      className={className}
      components={{
        // code: CodeBlock
      }}
    >
      {markdownContent}
    </ReactMD>
  );
}
```

---


### 6. TypeScript: 컴포넌트 Props 인터페이스

React 컴포넌트에서 사용될 props들의 타입을 정의하는 TypeScript 인터페이스입니다.

```typescript
interface OpenAiModelIconProps {
  className?: string;
}

interface MarkdownRendererProps {
  content: string;
  fileExtension?: string;
  truncate?: boolean;
  maxLength?: number;
  indented?: boolean;
}

interface RightArrowIconProps {
  className?: string;
}
```
