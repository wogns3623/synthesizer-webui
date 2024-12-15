Synthesizer web UI

## Getting Started

First, run the development server:

```bash
npm run dev
```

## 각 입력 섹션별 UI view

<!--
### Type definition

- 각 정의된 타입에 대한 리스트
- 타입 추가 버튼
  - 정의된 / 기본 타입 선택 가능
- 타입 작성은 string input VS select from list

### Function definition

- 예제 함수 선택기
  - 함수에 필요한 타입도 자동으로 추가
- 함수 이름만으로 축약된 리스트 & 펼쳐서 내용 확인

### Synthesized function signature

- 정의된 타입으로부터 arguments, return type 선택 -->

### Function input / outputs

- 각 입/출력에 대한 tab view
  - tree나 list타입도 동일한 ui로 보여주기 위함
  - 근데 이러면 tab이 3단이라서 너무 깊어진 느낌 들 수 있음
  <!-- - 함수 signature에 맞게 빈칸 생성? -->
- 수정도 필요없고 보여주기만 하면 됨
- 가능한 경우에만

## Design decisions

- 합성이 오래걸리는 문제의 경우 언제 끊어야 하는지/실패했다고 보여줘야 하는지
- 잘못된/작성중인 입력에 대해서 feedback 언제줄건지
  - code / ui view 전환할 때

## TODO

- 최상단 header 추가
- 합성 결과물 하단에 Ocaml form output 추가
  - trio option이 있다고 함
