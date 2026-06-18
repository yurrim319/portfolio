UE5의 Post Process Material에서 Luts Color Grading을 직접 재현하고 LUT 텍스쳐의 구조, UV 매핑, 텍스쳐 압축과 샘플링에 대해 스터디한 내용입니다.

태그 : UE5, Post Process, LUT, Material, HLSL, Texture Compression

---

// 01. overview

## **스터디 배경**

언리얼 엔진은 내부적으로 Color Grading을 256*16 LUT 텍스쳐 기반으로 처리한다. 이 과정은 엔진 내부에서 자동으로 동작하기 때문에 기존까지는 material로 따로 제작할 필요성을 느끼지 못했다.

그러나 LUT의 개별 파라미터를 독립적으로 제어할 필요성이 생겼고 현재의 post process 시스템으로 한계가 있다고 느껴 별도의 material fuction으로 제작하여 메인 post process material 내부에 구현하는 방식을 택했다.

(다이어그램으로 현재의 post process와 master pp material 관계에 대해 간략히 설명)

256*16 PNG를 직접 제작해 UE5로 가져오고, 그 픽셀 구조를 UV에 매핑해 씬 컬러에 Color Grading을 적용하는 것이 목표였다. 예상보다 텍스쳐 압축 이슈와 샘플링에서 많은 시간을 썼고, 그 과정이 가장 많이 배운 부분이 됐다.

---

// 02. concept

## **LUT Color Grading이란**

LUT(Look-Up Table)는 입력 색상 (R, G, B)을 출력 색상으로 매핑하는 테이블이다. 이론적으로는 RGB 각 채널을 축으로 하는 3D 큐브 형태지만, GPU에서 효율적으로 샘플링하려면 2D 텍스쳐로 펼쳐야 한다.

UE5가 채택한 방식은 Blue 채널 기준으로 큐브를 16장의 슬라이스로 잘라 수평으로 이어 붙인 **256×16 스트립**이다. Red는 각 슬라이스 내 X축, Green은 Y축에 대응하며 Blue는 어느 슬라이스를 고를지 결정한다.

즉, 사실 상 16*16*16 칸짜리 큐브 이미지를 세로로 길게 잘라붙인 것이라고 이해했다.

!RGBTable16x1_AssetViewer

RGBTable16x1_AssetViewer

fig.01 — 3D RGB Cube → 256×16 2D Strip

3D LUT Cube

R · G · B 각 축0 ~ 1 연속 공간

→

B축 슬라이싱

0~1 범위를 16단계로분할 → 16장의 2D면

→

수평 배치

16장 × 16px 폭= 256px 가로

→

256 × 16

2D LUT 텍스쳐완성

[ IMAGE ]

3D LUT Cube에서 2D Strip으로 펼쳐지는 과정 다이어그램 / 직접 제작 이미지

---

// 03. texture structure

## **256×16 텍스쳐 구조 분석**

256×16 LUT 텍스쳐는 16×16 픽셀짜리 슬라이스 16장이 수평으로 나열된 구조다. 각 슬라이스의 위치(0~15)가 Blue 채널 값에 대응하고, 슬라이스 내부에서 X축이 Red, Y축이 Green에 대응한다. 중립(Identity) LUT는 입력 색상을 그대로 출력하는 테이블이므로, 특정 색상 보정이 적용된 LUT를 사용하면 씬 전체에 동일한 톤 변환이 일어난다.

fig.02 — 256×16 슬라이스 구조 (B=0 ~ B=15)

B=0B=4B=8B=12B=15

가로 256px *= 16 slices × 16px*세로 16px *= G channel axis*

각 타일 내부: X → Red (0→1), Y → Green (0→1) / 색상은 B 채널 값의 변화를 시각화

---

// 04. uv mapping

## **UV 매핑 공식**

씬 컬러의 R, G, B 각 채널을 256×16 텍스쳐의 UV 좌표로 변환하는 것이 핵심이다. Blue 채널로 슬라이스 인덱스를 구하고, Red는 슬라이스 내 X 오프셋, Green은 Y 오프셋에 더해 최종 UV를 만든다. 

(여기서 0부터 인덱스를 세기 시작하므로 0-15의 값으로 인덱싱을 해주는게 중요하다. 막연히 텍스쳐 사이즈에 비례하게 16으로 인덱스 값을 슬라이스 했다가 관련 문서를 참고하여 수정하는 과정을 가졌다)

fig.03 — Material 노드 플로우

SceneTexture

PostProcessInput0

→

ComponentMask

R · G · B 분리

→

Custom Node

UV Remap(HLSL)

→

TextureSample

256×16 LUT

→

Emissive Color

PP Mat Output

[ IMAGE ]

UE5 Material 그래프 스크린샷 — Custom Node, SceneTexture, TextureSample 연결 구성

---

// 06. Bilinear sampling

## **샘플링 - Nearest Neighbor, Bilinear**

256×16 LUT는 16단계짜리 3D 격자이다. 고로 텍스쳐를 샘플링 처리 없이 그대로 매핑 시엔 컬러 보간이 없어 계단 현상이 일어나는 것을 확인 할 수 있다. 나의 목적은 post process의 LUTs을 그대로 구현하는 것이었으므로 컬러 보간이 필수적이었다.

기존 사용했던 수식은 UV를 정수 픽셀로 끊어서 수동으로 샘플링하는 형식이었다. (참고 - https://blog.naver.com/trashia/223444705142)

```
// R=0.73 일 때
r15 = 0.73 * 15 = 10.95

U_floor = (B_off + floor(10.95)) / 255  // floor → 10  → 정수 픽셀 10번
U_ceil  = (B_off + ceil(10.95))  / 255  // ceil  → 11  → 정수 픽셀 11번
fr      = frac(10.95) = 0.95

S_floor = Sample(U_floor)  // 픽셀 10번 중심을 정확히 샘플 → Nearest와 동일
S_ceil  = Sample(U_ceil)   // 픽셀 11번 중심을 정확히 샘플 → Nearest와 동일

final.r = lerp(S_floor.r, S_ceil.r, 0.95)  // 수동으로 섞음
```

해당 방식은 UV가 항상 정수 픽셀 중심에 떨어지므로 CPU(셰이더)가 직접적으로 보간하는 방식이었다. 사실 상 Nearest 샘플 방식에 근접하고 이전에 비해 깔끔해보이지만 여전히 프로젝트 퀄리티에 못미치고 구현 복잡도도 높다.

그래서 GPU Bilinear 필터 방식을 택했다. UV값이 연속적이면 GPU가 자동으로 보간할테니 연속값만 넘겨주면 샘플 한번으로 보간 처리가 된다. 

```jsx
// R=0.73 일 때
r15 = 0.73 * 15 = 10.95

U_floor = (B_off_floor + 10.95) / 255  // ← 10.95 그대로 (소수점 유지)
```

```jsx
텍스처 픽셀 10번과 11번 사이:

[픽셀 10]              [픽셀 11]
   |________10.95_________|
             ↑
         UV가 여기 → GPU Bilinear가 자동으로
         lerp(픽셀10, 픽셀11, 0.95) 계산
```

샘플값을 정수로 끊으면 UV가 항상 픽셀 중심에 스냅되는데 이게 계단현상을 만들어 퀄리티가 낮아보였던 것이었다. 

```
실제 색상값 분포 (R축 방향):

블로그:  ──●────●────●────●──  (픽셀 중심만 샘플, 사이는 수동 lerp)
권장:    ──────────────────── (연속, GPU가 모든 지점 보간)
```

수학적으로 동일해보이지만 수동 방식은 각 축을 독립적으로 lerp하므로 B 채널 전환 경계에서 아티팩트가 생길 수 있다. 그러므로 GPU Bilinear 방식으로 수정 후 B 채널만 별도의 슬라이스 간 보간을 추가해주었다.

---

// 05. texture compression

## **UE5 무손실 임포트 — 압축 설정과의 싸움**

256×16 PNG를 UE5에 임포트하고 PP Material에 연결했더니 처음엔 색이 미묘하게 틀어졌다. 분명히 중립 LUT를 넣었는데 출력 컬러가 살짝 달랐다. 원인은 텍스쳐 임포트 시 기본으로 걸리는 **DXT 압축(BC1)**이었다.

DXT1은 8bit 색상 정밀도를 5~6bit 수준으로 손실압축하기 때문에 LUT처럼 픽셀 값이 정확해야 하는 텍스쳐에는 절대 사용할 수 없다. 여기서 처음으로 UE5 Texture Compression 설정을 제대로 들여다보게 됐다.

fig.04 — UE5 Texture Compression 설정 비교

| **Compression Settings** | **내부 포맷** | **손실** | **Mip** | **LUT 적합** |
| --- | --- | --- | --- | --- |
| `Default / TC_Default` | DXT1 (BC1) | 있음 (색상 왜곡) | 자동 생성 | NG |
| `TC_Normalmap` | BC5 | RG만 저장 | 자동 생성 | NG |
| `TC_VectorDisplacementmap` | RGBA8 무압축 | 없음 | 없음 | OK |
| `TC_EditorIcon` | RGBA8 무압축 | 없음 | 없음 | OK |
| `TC_HDR` | BC6H | HDR 손실 | 자동 생성 | △ |

`TC_VectorDisplacementmap`을 선택하면 RGBA8 무압축으로 저장되고 Mip도 생성되지 않아 LUT 텍스쳐에 딱 맞는다. 추가로 반드시 **sRGB 체크를 해제**해야 한다. UE5 PP Material은 linear 공간에서 작동하는데 sRGB가 켜져 있으면 텍스쳐 샘플링 시 감마 보정이 한 번 더 들어가 색이 어두워진다.

**핵심 설정 체크리스트**Compression Settings: `TC_VectorDisplacementmap` (RGBA8 무압축)sRGB: `false` (반드시 해제)Mip Gen Settings: `NoMipmaps`Filter: `Bilinear` (또는 Nearest)

[ IMAGE ]

UE5 Texture Editor 스크린샷 — Compression Settings / sRGB 해제 / Mip 설정 부분Default 압축 vs TC_VectorDisplacementmap 비교 (색상 왜곡 차이)

---

// 06. sampling quality

## **Project Quality 샘플링**

TextureSamTextureSample 노드의 샘플링 퀄리티는 UE5 프로젝트 퀄리티 세팅에 묶여 있다. 에디터 뷰포트에서는 기본적으로 Epic 퀄리티로 동작하지만, 모바일이나 Low 퀄리티 타겟에서 실행하면 텍스쳐 LOD 바이어스가 적용돼 LUT 텍스쳐가 축소 샘플링될 수 있다.수 있다.

LUT 텍스쳐는 NoMipmaps으로 설정했으므로 LOD 자체는 발생하지 않지만, 퀄리티 세팅에서 Texture Quality를 낮추면 Streaming Mip 레벨에 영향을 준다. 이번 스터디는 에디터 내 Epic 퀄리티 기준으로 결과를 확인했다.

**샘플링 관련 설정**Sampler Type: `Linear Color` (Linear 공간 처리)LOD Bias: `0`Project Settings → Texture Quality: `Epic` 기준 검증

---

// 07. result

## **결과 및 배운 점**

[ IMAGE ]

적용 전후 비교 스크린샷 — Identity LUT (변환 없음) / 커스텀 LUT 적용 (색감 변경)씬 뷰포트 캡처

LUT 개념 자체는 단순하지만, UE5에서 "올바르게" 동작시키기 위해 텍스쳐 압축, sRGB 공간, 샘플링 오프셋까지 건드려야 했다. 특히 텍스쳐 압축 설정은 알고 있었지만 실제로 LUT처럼 정밀도가 중요한 상황에서 문제를 마주하고 나서야 확실히 이해했다.

엔진 내부에서 LUT가 어떻게 처리되는지를 PP Material로 직접 재현해보니, UE5의 Post Process 파이프라인 구조와 Color Grading이 어느 단계에서 개입하는지가 훨씬 구체적으로 그려졌다. 다음 스텝으로는 3D LUT 텍스쳐(VolumeTexture)를 직접 써보거나 커스텀 Tonemapper와 연결하는 것을 해볼 예정이다.