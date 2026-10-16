from __future__ import annotations

import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BASE = "https://genilo.kr"
PUBLISHED = "2026-10-17"


def guide(slug, title, description, intro, summary, sections, faq, kind="checker"):
    return {
        "slug": slug,
        "title": title,
        "description": description,
        "intro": intro,
        "summary": summary,
        "sections": sections,
        "faq": faq,
        "kind": kind,
    }


SERVICE_GUIDES = [
    guide(
        "seoul-mapo-homepage",
        "서울 마포 홈페이지 제작, 지역과 고객을 먼저 읽는 방법",
        "서울 마포 홈페이지 제작을 준비할 때 확인할 서비스 지역, 고객 질문, 모바일 상담 동선과 검색 정보 구조를 정리했습니다.",
        "서울 마포에서 홈페이지를 만든다는 것은 주소만 넣는 일이 아닙니다. 실제 영업 지역, 고객이 자주 묻는 질문, 연락 방식과 방문 정보를 한 화면에서 이해할 수 있게 정리해야 합니다.",
        ["업체명·주소·연락처를 모든 페이지에서 일관되게 표시합니다.", "지역명은 실제 서비스 범위와 문맥 안에서 사용합니다.", "전화·카카오톡·지도처럼 모바일에서 바로 행동할 경로를 연결합니다."],
        [
            ("지역 고객은 무엇을 먼저 확인하나요?", ["지역 서비스 고객은 제공 항목, 비용 범위, 방문 또는 출장 가능 지역, 영업시간과 연락 방법을 빠르게 확인합니다. 첫 화면에서 모든 내용을 나열하기보다 핵심 서비스와 지역, 상담 버튼을 먼저 보여주고 상세 설명으로 이어지는 편이 읽기 쉽습니다.", "공덕동처럼 구체적인 운영 위치와 전국 온라인 상담처럼 실제 제공 범위를 구분하면 과장 없이 지역성과 접근성을 함께 전달할 수 있습니다."], []),
            ("지역 검색을 위한 페이지 구조", ["하나의 페이지에 여러 지역명을 반복하는 대신 서비스별 또는 실제 영업권별로 충분한 정보를 제공해야 합니다. 페이지 제목, h1, 본문, 연락처와 구조화 데이터가 서로 다른 지역을 말하면 검색엔진과 방문자 모두 혼란을 느낍니다."], ["대표 주소와 연락처 일치", "실제 서비스 지역과 사례 설명", "길찾기·전화·상담 링크", "지역 고객이 묻는 질문과 답"]),
            ("비대면 제작도 가능한가요?", ["Studio Genilo는 서울 마포구 공덕동에서 운영하지만 자료 전달과 상담은 전화·카카오톡·온라인 중심으로 진행합니다. 지역 업체는 물론 전국 프로젝트도 같은 방식으로 기획, 시안 확인, 수정과 공개를 이어갈 수 있습니다.", "방문 미팅이 꼭 필요한지보다 의사결정자, 제공 자료, 수정 담당과 일정이 명확한지가 제작 속도에 더 큰 영향을 줍니다."], []),
            ("제작 전 준비할 자료", ["상호와 서비스 설명, 대표 연락처, 주소, 영업시간, 가격 또는 견적 기준, 실제 사진과 자주 받는 질문을 준비하면 페이지 문구를 구체적으로 만들 수 있습니다."], ["로고와 대표 이미지", "서비스 목록과 우선순위", "상담 가능한 시간과 채널", "사업자·업체 신뢰 정보"]),
        ],
        [("서울 업체만 의뢰할 수 있나요?", "아닙니다. 운영지는 서울 마포구이며 상담과 자료 전달은 온라인으로 진행해 전국 프로젝트를 제작할 수 있습니다."), ("지역명을 많이 넣으면 검색에 유리한가요?", "반복보다 실제 서비스 범위, 주소, 사례와 고객 질문을 일관되게 설명하는 것이 중요합니다."), ("지도 연결도 포함되나요?", "기본 제작 범위에서 외부 지도·전화·카카오톡 연결을 함께 구성할 수 있습니다.")],
        "service",
    ),
    guide(
        "seo-homepage-production",
        "SEO 전문 홈페이지 제작, 디자인 전에 검색 구조부터",
        "SEO 전문 홈페이지 제작에서 제목, 정보 구조, 내부 링크, 구조화 데이터와 공개 후 점검을 어떻게 함께 설계하는지 안내합니다.",
        "SEO에 강한 홈페이지는 완성된 디자인에 검색어를 덧붙인 결과가 아닙니다. 어떤 고객 질문에 어느 URL이 답할지 정하고, 그 구조를 제목·본문·내부 링크·대표 주소로 일관되게 구현한 결과입니다.",
        ["페이지마다 하나의 분명한 검색 의도를 정합니다.", "디자인과 동시에 제목 계층·본문·내부 링크를 설계합니다.", "공개 후 실제 URL을 다시 진단하고 수집·색인 상태를 확인합니다."],
        [
            ("SEO 전문 제작은 무엇이 다른가요?", ["일반 제작이 화면 구성과 기능 완성에 집중한다면 SEO 전문 제작은 기획 단계에서 URL별 역할을 먼저 나눕니다. 회사소개, 서비스, 사례, 문의와 가이드가 서로 같은 내용을 경쟁하지 않도록 제목과 내부 링크를 설계합니다."], ["검색 의도와 페이지 역할 정의", "title·description·h1 정합성", "본문 안의 관련 페이지 연결", "canonical·사이트맵·robots 설정"]),
            ("디자인과 검색 구조를 함께 잡는 이유", ["시각적으로 큰 문구가 반드시 문서의 h1이어야 하는 것은 아니지만, 화면 계층과 HTML 계층이 지나치게 다르면 유지보수가 어려워집니다. 사용자가 훑어보는 순서와 검색엔진이 해석하는 순서를 가깝게 만드는 것이 안정적입니다.", "이미지 안에만 핵심 문구를 넣지 않고 실제 텍스트로 제공하며, 모바일에서도 제목과 버튼이 자연스럽게 이어져야 합니다."], []),
            ("공개 전과 공개 후 점검", ["공개 전에는 200 응답, HTTPS, canonical, robots.txt, sitemap.xml, 모바일 레이아웃과 공유 정보를 확인합니다. 공개 후에는 네이버 서치어드바이저와 Google Search Console에서 수집·색인 상태를 확인하고, 실제 페이지 HTML을 체커로 재점검합니다."], ["리다이렉트와 대표 주소", "누락된 제목·설명", "끊어진 내부 링크", "서버 응답과 HTML 전송 속도"]),
            ("상단 노출을 보장하지 않는 이유", ["검색 순위는 경쟁 문서, 검색 의도, 지역과 시점, 콘텐츠 품질, 브랜드 신뢰와 검색 서비스 정책에 따라 달라집니다. 제작사가 통제할 수 있는 것은 페이지를 찾고 읽고 이해하기 쉬운 기반을 만드는 일입니다.", "따라서 순위 약속보다 어떤 항목을 어떻게 구현하고 공개 후 무엇을 확인하는지 설명하는 제작 범위가 더 중요합니다."], []),
        ],
        [("기본 SEO 설정은 제작비에 포함되나요?", "Studio Genilo 제작 상품에는 페이지별 제목·설명·공유 정보와 기본 검색 등록 범위를 포함합니다."), ("기존 홈페이지도 개선할 수 있나요?", "가능합니다. 먼저 공개 URL을 진단한 뒤 기술·콘텐츠 수정 범위를 우선순위에 따라 확정합니다."), ("검색 1위를 보장하나요?", "아닙니다. 수집·색인·페이지 이해를 돕는 기반을 공식 지침에 맞춰 구성하며 순위는 보장하지 않습니다.")],
        "service",
    ),
    guide(
        "small-business-homepage",
        "소상공인 홈페이지 제작, 문의로 이어지는 정보 순서",
        "소상공인 홈페이지에 필요한 서비스, 가격, 영업 지역, 연락 방법과 모바일 상담 동선을 실제 운영 관점에서 정리했습니다.",
        "소상공인 홈페이지는 큰 회사처럼 많은 메뉴를 만드는 것보다 고객이 결정을 내리는 데 필요한 정보를 빠짐없이 보여주는 일이 중요합니다. 서비스와 가격 기준, 위치, 영업시간, 실제 사진, 문의 방법을 짧은 동선 안에 배치합니다.",
        ["고객이 가장 많이 묻는 내용을 첫 화면 가까이에 둡니다.", "모바일 전화·카카오톡·지도 연결을 분명하게 제공합니다.", "직접 수정할 정보와 제작사에 요청할 범위를 미리 나눕니다."],
        [
            ("첫 화면에 무엇을 보여줘야 하나요?", ["업종명만 크게 쓰기보다 누구에게 어떤 서비스를 어느 지역에서 제공하는지 한 문장으로 설명해야 합니다. 대표 서비스, 실제 차별점과 상담 버튼을 함께 배치하면 방문자가 다음 행동을 고르기 쉽습니다."], []),
            ("가격을 모두 공개해야 하나요?", ["정찰제가 아니어도 시작 가격, 견적에 영향을 주는 조건, 상담 전에 준비할 정보를 안내할 수 있습니다. 가격을 숨기는 대신 범위와 판단 기준을 제공하면 불필요한 문의를 줄일 수 있습니다."], ["시작 가격 또는 가격대", "추가 비용이 발생하는 조건", "견적에 필요한 자료", "결제·예약 방법"]),
            ("신뢰를 만드는 정보", ["상호, 대표자, 사업자 정보, 실제 주소와 연락처를 일관되게 제공하고, 가능한 경우 작업 사례와 고객이 확인할 수 있는 근거를 연결합니다. 개인정보처리방침과 이용 조건도 문의폼이나 회원 기능이 있다면 함께 준비해야 합니다."], []),
            ("운영하기 쉬운 구조", ["계절 메뉴, 가격, 영업시간처럼 자주 바뀌는 정보는 수정 방법을 단순하게 정해야 합니다. 모든 문구를 관리 화면으로 만들기보다 변경 빈도가 높은 항목만 운영 기능으로 분리하면 제작비와 관리 부담을 함께 줄일 수 있습니다."], []),
        ],
        [("한 페이지로도 충분한가요?", "서비스 종류가 많지 않고 주요 행동이 상담·전화라면 한 페이지 구성으로 시작할 수 있습니다."), ("사진은 직접 준비해야 하나요?", "실제 매장·제품·작업 사진을 권장하며, 보유 자료에 따라 촬영 또는 이미지 제작 범위를 상담합니다."), ("네이버 검색 등록도 하나요?", "기본 제작 범위에서 사이트 정보와 검색 등록에 필요한 기술 설정을 함께 준비합니다.")],
        "service",
    ),
    guide(
        "corporate-homepage",
        "기업 홈페이지 제작, 사업과 신뢰를 연결하는 구조",
        "기업 홈페이지의 회사소개, 사업 분야, 제품·서비스, 실적, 채용과 문의 정보를 신뢰도 높은 구조로 설계하는 기준입니다.",
        "기업 홈페이지는 방문자마다 찾는 정보가 다릅니다. 고객은 서비스와 실적을, 지원자는 조직과 채용을, 협력사는 회사 정보와 연락처를 확인합니다. 서로 다른 목적을 명확한 정보 구조 안에서 빠르게 찾게 해야 합니다.",
        ["사업 분야와 제품·서비스의 관계를 먼저 정리합니다.", "회사 정보와 증빙 자료의 표현을 일관되게 맞춥니다.", "담당 부서별 문의 경로와 운영 책임을 명확히 둡니다."],
        [
            ("기업 사이트의 기본 정보 구조", ["회사소개, 사업 분야, 제품·서비스, 실적 또는 인증, 소식, 채용, 문의를 무조건 모두 만들 필요는 없습니다. 실제 영업과 채용에서 사용하는 정보를 기준으로 메뉴를 구성하고 비어 있는 메뉴는 만들지 않는 편이 낫습니다."], ["회사가 해결하는 문제", "사업 분야와 제공 서비스", "검증 가능한 실적·인증", "문의 담당과 연락 방법"]),
            ("신뢰 정보를 일관되게 표시하기", ["상호, 대표자, 주소, 전화, 이메일, 사업자 정보는 footer와 회사소개, 연락처, 구조화 데이터에서 서로 달라지지 않아야 합니다. 브랜드명이 법인명과 다르면 관계를 설명해 검색엔진과 방문자가 같은 조직으로 이해하게 합니다."], []),
            ("다국어·채용·뉴스 확장", ["다국어 페이지는 번역문만 복제하지 않고 언어별 URL과 hreflang, 현지 연락처와 날짜 표현을 함께 설계해야 합니다. 채용과 뉴스는 실제로 운영할 담당자가 있을 때 게시 기능을 붙이는 편이 안정적입니다."], []),
            ("기업 홈페이지의 검색 기반", ["서비스별 상세 페이지가 각기 다른 고객 질문에 답하도록 만들고 회사소개와 사례가 이를 뒷받침해야 합니다. 모든 키워드를 메인 페이지 하나에 넣기보다 URL별 주제를 나누고 내부 링크로 연결합니다."], []),
        ],
        [("기업 홈페이지 제작 기간은 얼마나 걸리나요?", "페이지 수, 원고·사진 준비 상태, 다국어와 기능 범위에 따라 달라지며 자료 접수 후 일정표를 확정합니다."), ("기존 자료를 그대로 사용할 수 있나요?", "회사소개서와 브로슈어를 활용할 수 있지만 웹에서 읽기 좋은 길이와 구조로 다시 편집해야 합니다."), ("관리자 기능이 꼭 필요한가요?", "소식·채용처럼 자주 갱신할 정보가 있을 때만 필요한 범위로 구성하는 편이 효율적입니다.")],
        "service",
    ),
    guide(
        "landing-page-production",
        "랜딩페이지 제작, 한 화면에서 전환까지 이어지는 설계",
        "광고와 캠페인 랜딩페이지에서 제안, 근거, 행동 버튼, 모바일 속도와 측정을 어떻게 연결하는지 안내합니다.",
        "랜딩페이지는 내용을 짧게 만드는 작업이 아니라 한 가지 제안과 한 가지 주요 행동에 집중하는 작업입니다. 광고 문구와 첫 화면, 근거, FAQ, 상담 또는 구매 버튼이 같은 약속을 이어가야 합니다.",
        ["한 페이지에 하나의 대상·제안·주요 행동을 둡니다.", "광고 문구와 첫 화면의 메시지를 일치시킵니다.", "전환 버튼, 분석 이벤트와 완료 화면까지 함께 확인합니다."],
        [
            ("첫 화면에서 답해야 할 질문", ["방문자는 누구를 위한 페이지인지, 무엇을 얻는지, 왜 지금 확인해야 하는지를 빠르게 판단합니다. 추상적인 슬로건보다 서비스 대상과 결과, 다음 행동을 구체적으로 적는 편이 효과적입니다."], []),
            ("설득의 순서를 만드는 방법", ["제안 다음에는 사용자가 믿을 근거를 보여주고, 선택 조건과 비용, 자주 묻는 질문으로 불안을 줄인 뒤 행동 버튼으로 이어갑니다. 모든 구역에 버튼을 반복하기보다 결정 시점에 맞춰 배치합니다."], ["대상과 문제", "해결 방식과 차이", "사례·수치·출처", "가격·조건·FAQ", "상담·구매·신청"]),
            ("모바일 속도와 공유 정보", ["광고 유입은 모바일 비중이 높을 수 있어 큰 영상과 이미지, 외부 스크립트를 신중하게 사용해야 합니다. 대표 공유 이미지, 페이지 제목과 설명도 광고 메시지와 어긋나지 않게 설정합니다."], []),
            ("전환 측정과 운영", ["버튼 클릭, 폼 제출, 전화와 카카오톡 이동처럼 실제 사업에 의미 있는 행동을 정하고 측정 범위를 합의합니다. 광고 플랫폼 픽셀을 무조건 많이 설치하면 속도와 개인정보 안내가 복잡해질 수 있으므로 필요한 도구만 연결합니다."], []),
        ],
        [("랜딩페이지도 SEO가 필요한가요?", "광고 전용이어도 제목·설명·대표 주소와 모바일 접근성을 갖춰야 하며, 검색 유입을 원한다면 충분한 본문과 내부 링크가 필요합니다."), ("한 페이지에 여러 상품을 넣어도 되나요?", "서로 다른 대상과 제안이라면 별도 페이지로 나누는 편이 메시지와 측정이 명확합니다."), ("분석 도구 연결도 가능한가요?", "가능합니다. 사용하는 광고·분석 도구와 측정할 행동을 정한 뒤 범위를 확정합니다.")],
        "service",
    ),
    guide(
        "responsive-homepage",
        "반응형 홈페이지 제작, 화면만 줄이지 않는 설계",
        "375px 모바일부터 큰 데스크톱까지 글 순서, 버튼, 이미지 비율과 가독성을 조정하는 반응형 홈페이지 제작 기준입니다.",
        "반응형 홈페이지는 데스크톱 화면을 비율대로 축소한 결과가 아닙니다. 기기 폭에 따라 정보의 우선순위, 글의 줄바꿈, 버튼 크기, 이미지 비율과 여백을 다시 결정해야 합니다.",
        ["모바일에서 먼저 읽을 정보 순서를 정합니다.", "버튼과 링크는 손가락으로 누르기 쉬운 크기와 간격을 둡니다.", "375px·768px·1024px·1440px에서 실제 콘텐츠로 확인합니다."],
        [
            ("모바일에서 달라져야 하는 것", ["두 열을 한 열로 쌓는 것만으로는 충분하지 않습니다. 데스크톱의 보조 이미지가 모바일에서는 핵심 문구를 밀어낼 수 있고, 긴 메뉴와 표는 별도 탐색 방식을 필요로 합니다."], ["콘텐츠 순서", "제목 줄바꿈", "버튼 크기와 간격", "표·탭·메뉴의 탐색 방식"]),
            ("이미지와 글자 품질", ["이미지는 표시 크기에 맞는 해상도와 형식을 제공하고 width와 height를 지정해 레이아웃 이동을 줄입니다. 한국어 제목은 글자 단위로 세로로 떨어지지 않도록 충분한 폭과 자연스러운 줄바꿈을 확보합니다."], []),
            ("실제 기기 폭에서 확인하기", ["고정된 기기 이름보다 콘텐츠가 깨지는 지점을 기준으로 레이아웃을 조정합니다. 약 375px 모바일, 768px 태블릿, 1024px 소형 노트북과 1440px 데스크톱에서 가로 스크롤과 잘린 문구를 확인합니다."], []),
            ("접근성과 성능까지 포함하기", ["키보드 초점이 보이고 확대를 막지 않아야 합니다. 모바일에서 무거운 장식과 자동재생 미디어를 줄이고, 움직임 줄이기 설정에서는 애니메이션을 멈추거나 단순화합니다."], []),
        ],
        [("모바일 버전을 따로 만들어야 하나요?", "대부분은 하나의 반응형 코드로 운영하며 콘텐츠와 기능이 크게 다를 때만 별도 구성을 검토합니다."), ("어떤 화면 크기를 기준으로 하나요?", "375px, 768px, 1024px, 1440px을 기본 점검 폭으로 사용하고 콘텐츠가 깨지는 구간을 추가 확인합니다."), ("반응형이 SEO에도 영향을 주나요?", "모바일 접근성과 가독성은 사용자 경험과 검색 수집에 중요한 기반이므로 기술 SEO와 함께 점검해야 합니다.")],
        "service",
    ),
    guide(
        "naver-google-search-setup",
        "네이버·구글 검색 설정, 공개 전에 준비할 항목",
        "네이버 서치어드바이저와 Google Search Console 등록 전 robots.txt, 사이트맵, canonical, 제목과 설명을 준비하는 방법입니다.",
        "검색 서비스 등록은 버튼 한 번으로 끝나지 않습니다. 공개 URL이 정상 응답하고, 대표 주소와 제목, 본문, robots.txt와 사이트맵이 서로 일치해야 네이버와 구글이 같은 페이지로 이해할 수 있습니다.",
        ["www·비www와 HTTP·HTTPS 주소를 하나로 통일합니다.", "페이지별 title·description·canonical을 실제 내용과 맞춥니다.", "사이트맵 제출 후 수집·색인 상태와 오류를 계속 확인합니다."],
        [
            ("등록 전에 먼저 확인할 것", ["검색 도구에 사이트를 등록하기 전에 브라우저에서 공개 URL이 200 응답을 내는지, 로그인 없이 본문을 읽을 수 있는지, robots.txt가 필요한 페이지를 막지 않는지 확인합니다."], ["HTTPS와 리다이렉트", "대표 주소 canonical", "페이지별 제목과 설명", "robots.txt와 sitemap.xml"]),
            ("네이버와 구글의 공통 기반", ["두 검색 서비스 모두 수집 가능한 링크와 명확한 본문이 필요합니다. 소유 확인 태그와 사이트맵 제출은 발견을 돕지만, 내용이 부족하거나 중복 주소가 많으면 등록만으로 해결되지 않습니다."], []),
            ("등록 뒤에 확인할 것", ["수집 요청 뒤 바로 상단 노출되는 것은 아닙니다. 실제로 색인된 대표 URL, 검색 제목과 설명, 모바일 페이지 상태, 제외된 URL의 이유를 확인하고 사이트 수정과 재수집을 반복합니다."], []),
            ("체커로 사전 점검하기", ["Studio Genilo SEO 체커는 외부에서 접근 가능한 HTML과 응답 헤더, robots.txt, 사이트맵, 메타 태그, 본문 구조와 네트워크 단계를 확인합니다. 등록 전 공개 오류를 찾고 수정 뒤 같은 URL을 재점검할 때 사용할 수 있습니다."], []),
        ],
        [("사이트맵을 제출하면 바로 노출되나요?", "아닙니다. 사이트맵은 URL 발견을 돕는 신호이며 수집·색인과 순위는 페이지 품질과 정책에 따라 결정됩니다."), ("네이버와 구글 설정은 같나요?", "공통 기술 기반은 비슷하지만 소유 확인, 관리 도구와 일부 크롤러 정책은 각각 확인해야 합니다."), ("검색 등록은 제작에 포함되나요?", "Studio Genilo 기본 제작에서는 사이트 정보와 등록에 필요한 기본 설정을 함께 준비합니다.")],
        "service",
    ),
    guide(
        "web-app-development",
        "웹앱 개발, 예약·주문·회원·관리자 기능을 설계하는 기준",
        "소개 사이트를 넘어 예약, 주문, 회원, 관리자와 데이터가 필요한 웹앱 개발의 범위와 운영 기준을 안내합니다.",
        "웹앱은 화면 수보다 사용자가 어떤 일을 완료하고 운영자가 어떤 데이터를 관리해야 하는지가 중요합니다. 예약, 주문, 회원과 관리자 기능을 실제 업무 흐름에 맞춰 정의해야 합니다.",
        ["사용자와 운영자의 핵심 작업을 먼저 정의합니다.", "외부 결제·알림·지도 서비스의 비용과 책임을 구분합니다.", "오류·빈 상태·권한·모바일 사용까지 기능 범위에 포함합니다."],
        [
            ("기능 목록보다 사용자 흐름", ["회원가입, 결제, 관리자라는 단어만으로는 개발 범위를 확정할 수 없습니다. 누가 어떤 정보로 시작해 어떤 결과를 받고, 실패하면 어디서 복구하는지 화면과 데이터 흐름으로 정리해야 합니다."], []),
            ("예약과 주문에서 정해야 할 것", ["상품·시간·재고·취소·환불·알림 정책이 먼저 정해져야 화면과 데이터 구조가 안정됩니다. 운영자가 수동으로 처리할 부분과 시스템이 자동으로 처리할 부분도 구분합니다."], ["재고 또는 예약 가능 시간", "결제와 환불 상태", "고객 알림", "운영자 처리 이력"]),
            ("회원과 관리자 권한", ["고객, 직원, 관리자처럼 역할별로 볼 수 있는 정보와 실행할 수 있는 작업을 나눕니다. 개인정보는 꼭 필요한 범위만 수집하고 보관·삭제 정책과 관리자 접근 기록을 함께 검토합니다."], []),
            ("공개 이후 운영", ["웹앱은 공개가 끝이 아니라 실제 사용 중 발생하는 오류, 외부 API 변경, 보안 업데이트와 데이터 백업을 계속 관리해야 합니다. 유지보수 범위와 대응 시간을 제작 계약에서 분리해 명확히 정하는 편이 좋습니다."], []),
        ],
        [("웹앱 비용은 왜 고정가가 아닌가요?", "같은 예약·회원 기능도 상태, 권한, 외부 연동과 관리자 범위에 따라 개발량이 크게 달라 상담 후 확정합니다."), ("기존 홈페이지에 기능만 추가할 수 있나요?", "기존 기술 구조와 호스팅 환경을 확인한 뒤 추가 가능 여부와 분리 개발 여부를 판단합니다."), ("모바일 앱도 함께 필요한가요?", "웹에서 충분한지 먼저 검토하고 푸시 알림·기기 기능 등 앱 고유 요구가 있을 때 별도 앱을 검토합니다.")],
        "service",
    ),
]


CHECKER_GUIDES = [
    guide(
        "seo-score",
        "SEO 점수와 SEO 지수, 숫자보다 먼저 읽을 것",
        "SEO 점수와 SEO 지수가 무엇을 측정하고 무엇을 보장하지 않는지, 진단 결과를 개선 우선순위로 읽는 방법을 설명합니다.",
        "SEO 점수는 공개 페이지가 수집·색인·이해에 필요한 기술과 콘텐츠 기준을 얼마나 갖췄는지 항목별 상태로 환산한 진단값입니다. 실제 검색 순위를 그대로 예측하는 공식 점수는 아닙니다.",
        ["총점보다 개선필요 항목과 확인 근거를 먼저 봅니다.", "기술·콘텐츠·신뢰·전송 성능을 분리해 원인을 찾습니다.", "수정 뒤 같은 URL을 재점검해 상태 변화를 확인합니다."],
        [
            ("SEO 점수는 어떻게 만들어지나요?", ["체커는 제목, 설명, canonical, 크롤러 접근, 본문 제목 구조, 링크, 이미지, 구조화 데이터와 네트워크 응답을 검사합니다. 각 항목의 중요도와 상태를 합산해 영역별 점수와 전체 진단을 제공합니다."], []),
            ("100점이면 상단 노출되나요?", ["아닙니다. 높은 점수는 공개적으로 확인 가능한 기본기가 준비됐다는 뜻입니다. 실제 순위는 검색 의도, 경쟁 문서, 최신성, 링크와 평판, 사용자 위치, 검색 서비스 정책에 따라 달라집니다."], []),
            ("결과를 읽는 순서", ["먼저 수집을 막는 응답 오류와 robots, noindex를 확인합니다. 다음으로 제목·설명·대표 주소와 본문 주제를 맞추고, 구조화 데이터와 신뢰 정보, 네트워크 속도를 점검합니다."], ["접근·색인 차단", "페이지 주제와 메타 정보", "본문·내부 링크·이미지", "신뢰·구조화 데이터·속도"]),
            ("재점검이 필요한 이유", ["코드를 수정해도 CDN 캐시, 배포 누락, 리다이렉트와 실제 운영 주소 때문에 결과가 달라질 수 있습니다. 수정한 파일이 아니라 공개 URL을 다시 검사해야 개선이 반영됐는지 확인할 수 있습니다."], []),
        ],
        [("SEO 점수는 공식 검색엔진 지표인가요?", "아닙니다. 공개된 기술·콘텐츠 기준을 바탕으로 준비 상태를 비교하기 위한 진단값입니다."), ("몇 점부터 좋은가요?", "절대 점수보다 개선필요 항목이 수집과 페이지 이해를 막는지 먼저 판단해야 합니다."), ("점수가 갑자기 달라질 수 있나요?", "서버 응답, 캐시, 페이지 수정과 외부 자원 상태에 따라 일부 항목은 달라질 수 있습니다.")],
    ),
    guide(
        "free-seo-check",
        "무료 SEO 체크, 주소 하나로 무엇을 확인할 수 있나요?",
        "무료 SEO 체크에서 HTML, 응답 헤더, robots.txt, 사이트맵, 메타 태그, 본문 구조, 링크와 네트워크 속도를 확인하는 범위를 설명합니다.",
        "무료 SEO 체크는 공개 URL에서 검색엔진과 방문자가 실제로 받을 수 있는 정보를 기준으로 문제를 찾습니다. 관리자 권한 없이도 HTML, 응답 헤더와 공개 설정을 확인할 수 있습니다.",
        ["네이버 SEO·구글 SEO·AEO·GEO 영역을 분리해 봅니다.", "잘된 점, 주의, 개선필요와 실제 확인 근거를 함께 제공합니다.", "사이트 내부 데이터나 비공개 검색 순위를 수집하지 않습니다."],
        [
            ("어떤 파일과 신호를 검사하나요?", ["페이지 HTML과 HTTP 응답 헤더를 중심으로 robots.txt, sitemap.xml, RSS와 llms.txt의 공개 여부를 확인합니다. title, description, canonical, Open Graph, 제목 계층, 링크, 이미지와 JSON-LD도 함께 분석합니다."], []),
            ("네트워크 단계도 보는 이유", ["페이지 내용이 좋아도 DNS, 서버 연결, TLS 협상, 첫 응답과 HTML 다운로드가 느리면 크롤러와 사용자 모두 기다려야 합니다. 체커는 어느 구간이 느린지 분리해 보여줍니다."], []),
            ("체커가 볼 수 없는 것", ["관리자 도구의 실제 검색어·클릭·노출 데이터, 검색엔진 내부 평가, 경쟁 사이트의 비공개 신호는 볼 수 없습니다. Search Console과 서치어드바이저 데이터는 사이트 소유자가 별도로 확인해야 합니다."], []),
            ("점검 결과를 수정으로 연결하기", ["개선필요 항목 중 수집과 색인을 막는 문제를 먼저 처리하고, 페이지 주제·본문·신뢰 정보와 속도를 차례로 개선합니다. 수정 뒤 같은 주소를 다시 입력해 공개 결과가 바뀌었는지 확인합니다."], []),
        ],
        [("로그인이 필요한 페이지도 검사하나요?", "공개적으로 접근 가능한 URL을 기준으로 하며 로그인 뒤 화면은 정상 분석하기 어렵습니다."), ("검사 결과가 저장되나요?", "체커 화면의 안내와 서비스 정책을 확인하고 민감한 토큰이 포함된 URL은 입력하지 않는 것이 안전합니다."), ("무료 점검 뒤 상담도 가능한가요?", "결과 화면에서 SEO 개선 또는 SEO·AEO·GEO 통합 개선 상담으로 이어갈 수 있습니다.")],
    ),
    guide(
        "naver-seo",
        "네이버 SEO 점검, Yeti와 사이트 정보를 함께 보는 법",
        "네이버 SEO에서 Yeti 접근, 사이트 소유 확인, title, description, canonical, 사이트맵과 초기 HTML을 점검하는 기준입니다.",
        "네이버 SEO는 서치어드바이저 등록만으로 끝나지 않습니다. Yeti가 공개 페이지에 접근할 수 있고, 대표 주소와 제목, 설명, 본문, 사이트맵이 같은 페이지를 설명해야 합니다.",
        ["Yeti 접근과 robots.txt 정책을 확인합니다.", "소유 확인 태그·사이트맵·대표 주소를 일치시킵니다.", "자바스크립트 실행 전 초기 HTML에 핵심 내용을 제공합니다."],
        [
            ("Yeti가 페이지에 접근할 수 있나요?", ["robots.txt에서 Yeti를 막지 않았는지, 서버나 보안 서비스가 크롤러 요청을 403으로 거부하지 않는지 확인합니다. 공개 페이지는 정상적인 200 응답과 읽을 수 있는 HTML을 제공해야 합니다."], []),
            ("사이트 소유 확인과 사이트맵", ["소유 확인 메타 태그는 관리 도구 연결을 증명하고 사이트맵은 발견할 URL을 알려줍니다. 사이트맵 안 URL이 실제 대표 주소와 다르거나 오류 응답이면 제출 효과가 떨어집니다."], []),
            ("제목·설명·공유 정보", ["title, description, canonical과 Open Graph가 서로 다른 서비스나 주소를 가리키지 않아야 합니다. 제목은 페이지 주제를 구체적으로 설명하고 모든 페이지에서 똑같이 반복하지 않습니다."], []),
            ("초기 HTML과 본문", ["브라우저에서 JavaScript가 실행된 뒤에만 제목과 본문이 나타나는 구조는 수집 안정성이 떨어질 수 있습니다. 핵심 설명, h1과 내부 링크를 초기 HTML에 제공하고 화면 문구와 메타 정보의 주제를 맞춥니다."], []),
        ],
        [("네이버 소유 확인 태그가 꼭 필요한가요?", "검색 노출의 절대 조건은 아니지만 서치어드바이저에서 사이트를 관리하고 수집 상태를 확인하려면 필요합니다."), ("Yeti를 robots.txt에 따로 허용해야 하나요?", "전체 공개 정책으로 접근 가능하다면 필수는 아니며 별도 규칙이 기존 허용을 덮어쓰지 않는지 확인해야 합니다."), ("네이버 SEO 점수만 따로 볼 수 있나요?", "Studio Genilo 체커 결과에서 네이버 SEO 영역과 항목별 근거를 분리해 확인할 수 있습니다.")],
    ),
    guide(
        "google-seo",
        "구글 SEO 점검, Googlebot부터 구조화 데이터까지",
        "구글 SEO에서 Googlebot 접근, 색인 지시, 모바일, 구조화 데이터, 이미지, 내부 링크와 전송 성능을 확인하는 방법입니다.",
        "구글 SEO 점검은 Googlebot 접근과 색인 지시만 보지 않습니다. 페이지 주제, 모바일 가독성, 구조화 데이터, 이미지와 링크, 서버가 HTML을 보내는 과정까지 함께 확인해야 합니다.",
        ["Googlebot 접근·robots·noindex·canonical을 먼저 확인합니다.", "모바일 화면과 초기 HTML의 핵심 내용을 점검합니다.", "JSON-LD, 내부 링크, 이미지와 네트워크 응답을 함께 봅니다."],
        [
            ("수집과 색인 지시", ["Googlebot이 URL에 접근하고 200 응답을 받는지, robots.txt가 필요한 자원을 막지 않는지, meta robots와 X-Robots-Tag가 noindex를 보내지 않는지 확인합니다."], []),
            ("대표 URL과 중복 페이지", ["HTTP·HTTPS, www·비www, 쿼리 주소가 같은 내용을 제공하면 redirect와 canonical로 대표 주소를 정리합니다. canonical은 힌트이므로 내부 링크와 사이트맵도 같은 대표 URL을 사용해야 합니다."], []),
            ("모바일·이미지·구조화 데이터", ["viewport, 누르기 쉬운 링크, 자연스러운 줄바꿈과 가로 스크롤을 확인합니다. 이미지는 크기 속성과 설명을 제공하고, JSON-LD는 화면에 보이는 업체·저자·콘텐츠 정보와 일치해야 합니다."], []),
            ("서버와 전송 성능", ["DNS, TCP, TLS, TTFB와 HTML 다운로드를 분리하면 지연 원인을 찾기 쉽습니다. 서버 처리와 캐시, 배포 지역, 문서 크기와 압축은 각각 다른 개선 방법이 필요합니다."], []),
        ],
        [("구글 SEO 점수가 높으면 바로 색인되나요?", "아닙니다. 점수는 준비 상태이며 실제 수집·색인은 Search Console에서 확인해야 합니다."), ("구조화 데이터가 순위를 올리나요?", "직접적인 순위 보장 수단이 아니라 페이지의 개체와 콘텐츠를 이해하고 일부 검색 기능에 활용하는 데 도움을 줍니다."), ("Core Web Vitals도 검사하나요?", "현재 체커는 서버·HTML 전송과 공개 구조를 중심으로 보며 실제 사용자 Core Web Vitals는 PageSpeed Insights와 Search Console을 함께 확인해야 합니다.")],
    ),
    guide(
        "geo-score",
        "GEO 점수, 생성형 검색이 인용하기 쉬운 페이지의 조건",
        "GEO 점수가 업체·저자·근거·대표 URL·AI 크롤러 정책과 발견 경로를 어떻게 평가하는지 설명합니다.",
        "GEO는 생성형 검색과 AI 답변이 페이지의 업체, 사람, 서비스, 주장과 출처를 식별하기 쉬운지 살펴보는 접근입니다. 검색 서비스가 제공하는 단일 공식 점수는 아닙니다.",
        ["업체·저자·웹사이트 엔티티를 일관되게 연결합니다.", "주장 가까이에 확인 가능한 근거와 출처를 둡니다.", "회사소개·연락처·정책·사이트맵·피드로 발견 경로를 제공합니다."],
        [
            ("GEO 점수는 무엇을 보나요?", ["Organization, Person, WebSite 같은 구조화 데이터의 연결, 대표 URL, 작성자와 수정일, 회사소개와 연락처, 개인정보처리방침, 외부 근거 링크와 AI 크롤러 정책을 확인합니다."], []),
            ("인용 가능한 문장 만들기", ["한 문단에 하나의 핵심 사실을 담고 주어와 대상을 분명히 씁니다. 가격·기간·수치에는 기준일과 조건을 붙이며, 외부 근거가 필요한 주장은 해당 문장 가까이에 공식 출처를 연결합니다."], []),
            ("업체와 사람을 식별하는 정보", ["상호, 브랜드명, 대표자, 주소, 연락처가 페이지마다 달라지지 않아야 합니다. Organization과 Person의 @id를 사용해 회사, 대표자와 웹사이트의 관계를 연결하면 같은 개체로 해석하기 쉽습니다."], []),
            ("AI 크롤러와 발견 경로", ["robots.txt 정책, sitemap.xml, RSS와 llms.txt는 공개 콘텐츠를 발견하고 범위를 이해하는 보조 경로입니다. 허용 정책은 검색 노출, 사용자 요청형 접근과 모델 학습 목적을 구분해 운영할 수 있습니다."], []),
        ],
        [("GEO는 구글만을 위한 최적화인가요?", "아닙니다. 구글 AI 개요뿐 아니라 여러 생성형 검색과 답변 환경에서 공개 신호를 읽기 쉽게 만드는 접근입니다."), ("llms.txt가 꼭 필요한가요?", "공식 순위 요소나 필수 표준은 아니며 공개 콘텐츠 안내를 보조하는 파일로 사용할 수 있습니다."), ("GEO 점수가 AI 인용을 보장하나요?", "아닙니다. 인용 여부는 각 서비스의 모델, 검색 결과, 질문과 정책에 따라 달라집니다.")],
    ),
    guide(
        "aeo-score",
        "AEO 점수, 질문에 바로 답하는 콘텐츠 구조",
        "AEO 점수에서 질문형 제목, 직접 답변, FAQ, 표, 정의, 출처와 작성자 정보를 점검하는 방법입니다.",
        "AEO는 답변엔진이 사용자의 질문과 그에 대한 결론을 빠르게 구분하도록 콘텐츠를 구성하는 접근입니다. 질문 바로 아래에서 핵심 답을 제공하고 조건과 근거를 이어 설명합니다.",
        ["실제 사용자가 묻는 문장을 제목으로 사용합니다.", "첫 문단에서 결론을 답하고 다음 문단에서 조건을 설명합니다.", "FAQ·표·정의 목록은 화면과 구조화 데이터가 일치하게 만듭니다."],
        [
            ("질문과 답을 가까이 배치하기", ["질문형 h2 또는 h3 바로 아래 첫 문단에 짧고 완결된 답을 둡니다. 배경 설명을 길게 한 뒤 마지막에 결론을 숨기면 사용자와 답변엔진 모두 핵심을 찾기 어렵습니다."], []),
            ("구체적인 답변의 조건", ["가격, 기간, 대상과 기준일을 명확히 쓰고 예외 조건을 함께 제공합니다. ‘빠릅니다’보다 ‘자료 접수 후 3~5영업일 예상’처럼 판단 가능한 문장이 유용합니다."], []),
            ("의미에 맞는 HTML", ["단계가 필요하면 ol, 순서 없는 항목은 ul, 용어와 설명은 dl, 비교 데이터는 caption·th·scope가 있는 table을 사용합니다. 시각적인 모양만 맞추기 위해 의미 없는 div를 반복하지 않습니다."], []),
            ("FAQ 구조화 데이터", ["FAQPage를 사용한다면 화면에 실제 질문과 답이 보여야 하며 JSON-LD 문구와 일치해야 합니다. 구조화 데이터만 숨겨 넣는 방식은 신뢰할 수 있는 답변 기반이 되기 어렵습니다."], []),
        ],
        [("모든 제목을 질문형으로 써야 하나요?", "아닙니다. 실제 질문에 답하는 구역에서만 자연스럽게 사용하고 문서 전체의 읽기 흐름을 우선합니다."), ("FAQ를 많이 넣으면 AEO 점수가 오르나요?", "개수보다 질문의 실제성, 답의 완결성, 본문과 구조화 데이터의 일치가 중요합니다."), ("AEO와 SEO는 다른가요?", "AEO는 답 추출에 초점을 두지만 수집·색인·페이지 신뢰 같은 SEO 기반 위에서 작동합니다.")],
    ),
    guide(
        "website-network-speed",
        "웹사이트 네트워크 속도, DNS부터 HTML 다운로드까지",
        "DNS, TCP, TLS, TTFB, HTML 다운로드와 처리량을 분리해 웹사이트 네트워크 속도와 기술 SEO 문제를 찾는 방법입니다.",
        "웹사이트 속도는 하나의 숫자가 아닙니다. 도메인을 찾고 서버에 연결하고 HTTPS를 협상한 뒤 첫 응답과 HTML을 받는 여러 단계가 이어지므로 느린 구간에 따라 개선 방법이 달라집니다.",
        ["DNS·TCP·TLS·TTFB·다운로드 시간을 분리합니다.", "서버 처리, 연결, 문서 크기 문제를 같은 원인으로 보지 않습니다.", "한 번의 측정이 아니라 위치와 시간대가 다른 결과를 비교합니다."],
        [
            ("DNS와 서버 연결", ["DNS는 도메인을 IP 주소로 찾는 시간이고 TCP는 서버와 연결을 만드는 시간입니다. 특정 지역에서만 느리다면 DNS 사업자, CDN과 서버 배포 위치를 함께 확인합니다."], []),
            ("TLS와 HTTPS", ["TLS는 암호화 연결을 협상하는 단계입니다. 인증서 체인, 프로토콜과 서버 위치가 영향을 줄 수 있으며 HTTPS 자체를 없애는 방식이 아니라 최신 설정과 연결 재사용으로 개선해야 합니다."], []),
            ("TTFB와 HTML 다운로드", ["TTFB는 요청 후 첫 바이트가 도착하기까지의 시간으로 서버 처리와 캐시의 영향을 많이 받습니다. 첫 응답은 빠른데 다운로드만 느리면 HTML 크기, 압축과 전송 처리량을 확인합니다."], []),
            ("SEO와 함께 보는 이유", ["크롤러가 페이지를 안정적으로 받고 사용자가 본문을 빠르게 확인할 수 있는 기반은 중요합니다. 다만 네트워크 측정만으로 화면 렌더링과 상호작용 성능을 모두 설명할 수 없어 Core Web Vitals와 실제 사용자 데이터를 함께 봐야 합니다."], []),
        ],
        [("TTFB는 몇 ms여야 하나요?", "환경과 페이지 유형에 따라 다르며 한 번의 절대값보다 같은 위치에서 반복 측정하고 느린 구간을 찾는 것이 중요합니다."), ("CDN을 쓰면 모두 빨라지나요?", "정적 자원과 지역 간 거리를 줄이는 데 도움이 되지만 원본 서버 처리와 잘못된 캐시 정책은 별도로 개선해야 합니다."), ("체커에서 네트워크 단계를 볼 수 있나요?", "네. Studio Genilo 체커는 DNS, TCP, TLS, TTFB와 HTML 다운로드를 분리해 표시합니다.")],
    ),
    guide(
        "seo-score-limit",
        "SEO 점수의 한계, 상단 노출을 보장하지 않는 이유",
        "SEO 점수가 높아도 상단 노출이 보장되지 않는 이유와 체커 결과를 실제 검색 데이터와 함께 해석하는 방법입니다.",
        "SEO 점수는 공개 URL의 기술·콘텐츠 준비 상태를 비교하는 도구입니다. 검색엔진 내부 평가, 경쟁 문서, 실제 검색어와 사용자 반응을 모두 알 수 없기 때문에 점수만으로 상단 노출을 예측할 수 없습니다.",
        ["점수는 순위 예측값이 아니라 공개 기반의 진단값입니다.", "Search Console·서치어드바이저의 실제 수집·검색 데이터를 함께 봅니다.", "경쟁 문서보다 사용자 질문에 더 정확히 답하는 콘텐츠를 지속적으로 개선합니다."],
        [
            ("체커가 확인할 수 있는 범위", ["응답 코드, 크롤러 정책, 메타 태그, 본문 구조, 링크, 이미지, 구조화 데이터, 신뢰 페이지와 네트워크 전송은 외부에서 확인할 수 있습니다. 이 범위는 오류를 찾고 수정 우선순위를 정하는 데 유용합니다."], []),
            ("체커가 알 수 없는 범위", ["검색엔진의 내부 점수, 경쟁 사이트의 비공개 데이터, 개인화된 검색 결과, 실제 클릭과 전환, 링크의 품질과 브랜드 평판 전체는 공개 페이지만으로 정확히 알 수 없습니다."], []),
            ("점수와 실제 검색 데이터를 연결하기", ["기술 오류를 수정한 뒤 Search Console과 서치어드바이저에서 색인 여부, 노출 검색어, 클릭과 대표 URL을 확인합니다. 노출은 있지만 클릭이 적다면 제목과 설명을, 노출 자체가 없다면 주제와 콘텐츠 경쟁력을 다시 봅니다."], []),
            ("안전한 개선 순서", ["수집·색인 차단을 먼저 없애고, 페이지 주제와 답변을 명확히 하며, 내부 링크와 신뢰 근거를 보강합니다. 점수를 올리기 위한 장식 항목보다 사용자가 찾는 답을 제공하는 변경을 우선합니다."], []),
        ],
        [("SEO 점수 100점은 의미가 없나요?", "기술적 준비가 잘됐다는 의미는 있지만 특정 키워드의 순위를 보장하지는 않습니다."), ("점수가 낮으면 검색에 절대 노출되지 않나요?", "아닙니다. 다만 수집·색인을 막는 오류나 주제 불명확성이 있다면 개선할 가치가 큽니다."), ("어떤 데이터를 함께 봐야 하나요?", "Search Console, 네이버 서치어드바이저, 분석 도구의 노출·클릭·방문·전환 데이터를 함께 확인하세요.")],
    ),
]


NOUNS = {
    "webpage": {
        "ko": "웹페이지",
        "scope": "하나의 고유 URL과 그 안의 제목·본문·링크·이미지",
        "difference": "웹페이지는 특정 검색 질문에 답하는 단일 문서입니다. 사이트 전체 평가와 연결되지만 이 URL만의 주제와 답이 분명해야 합니다.",
        "checks": ["페이지별 고유 title·description·h1", "검색 질문에 직접 답하는 첫 문단", "관련 상위·하위 페이지로 이어지는 내부 링크", "대표 URL canonical과 200 응답"],
        "risk": "여러 URL이 같은 키워드와 같은 본문을 반복하면 어느 페이지를 대표로 보여줄지 불분명해집니다.",
    },
    "website": {
        "ko": "웹사이트",
        "scope": "도메인 전체의 URL 구조·탐색·수집 정책·주제 묶음",
        "difference": "웹사이트는 여러 페이지가 연결된 전체 정보 체계입니다. 좋은 개별 문서가 있어도 메뉴, 내부 링크, 사이트맵과 대표 주소가 어긋나면 발견과 이해가 어려워집니다.",
        "checks": ["서비스·사례·가이드의 명확한 URL 구조", "robots.txt·sitemap.xml·redirect·canonical", "중요 페이지로 이어지는 탐색과 내부 링크", "회사소개·연락처·정책의 신뢰 정보"],
        "risk": "비슷한 주제의 페이지를 대량으로 만들고 서로 연결하지 않으면 얇은 문서와 중복 의도가 늘어날 수 있습니다.",
    },
    "homepage": {
        "ko": "홈페이지",
        "scope": "도메인의 대표 진입 페이지와 업체·브랜드·핵심 서비스 정보",
        "difference": "홈페이지는 모든 검색어를 담는 페이지가 아니라 사이트의 주체와 핵심 서비스를 설명하고 적절한 상세 페이지로 안내하는 대표 입구입니다.",
        "checks": ["업체·브랜드와 핵심 서비스의 명확한 한 문장", "회사소개·서비스·사례·문의로 이어지는 탐색", "Organization·WebSite 구조화 데이터", "대표 주소·연락처·수정일의 일관성"],
        "risk": "메인 화면에 모든 키워드와 긴 설명을 몰아넣으면 방문자는 핵심 행동을 찾기 어렵고 상세 페이지의 역할도 약해집니다.",
    },
}


AXES = {
    "top-ranking": {
        "ko": "상단노출",
        "label": "검색 노출 가이드",
        "lead": "상단노출은 설정 하나로 보장되는 결과가 아니라 검색 의도에 맞는 답, 수집 가능한 기술 구조, 신뢰와 경쟁 문서의 상대 평가가 함께 작동한 결과입니다.",
        "section_titles": ["상단노출을 준비한다는 뜻", "기술 기반에서 먼저 확인할 것", "검색 의도와 콘텐츠를 맞추는 법", "노출 이후 측정과 개선"],
        "axis_paragraphs": [
            "순위를 약속하기보다 검색엔진이 문서를 안정적으로 찾고 대표 URL을 선택하며 주제를 이해할 수 있게 만드는 것이 출발점입니다.",
            "HTTPS, 200 응답, robots, noindex, canonical과 사이트맵을 확인하고 모바일 화면과 서버 응답도 함께 점검합니다.",
            "검색어를 반복하는 대신 방문자가 실제로 알고 싶은 조건, 가격, 범위, 근거와 다음 행동을 완결된 문장으로 제공합니다.",
            "Search Console과 네이버 서치어드바이저에서 색인, 노출 검색어와 클릭을 확인하고 체커 결과와 연결해 다음 수정 우선순위를 정합니다.",
        ],
        "summary": ["순위 보장 문구보다 수집·색인·이해 기반을 확인합니다.", "검색 의도마다 가장 적절한 대표 URL을 정합니다.", "노출·클릭·문의 데이터를 보고 지속적으로 개선합니다."],
    },
    "seo": {
        "ko": "SEO",
        "label": "검색엔진 최적화",
        "lead": "SEO는 검색엔진이 공개 문서를 찾고 읽고 대표 주소와 주제를 이해하도록 기술과 콘텐츠를 정리하는 작업입니다.",
        "section_titles": ["SEO의 적용 범위", "수집과 색인 기반", "본문과 내부 링크 설계", "진단 결과를 수정으로 연결하기"],
        "axis_paragraphs": [
            "title과 description만 바꾸는 작업이 아니라 URL 역할, HTML 제목 계층, 본문, 이미지, 링크, 구조화 데이터와 서버 응답을 함께 봅니다.",
            "robots.txt와 meta robots, canonical, redirect와 sitemap.xml이 같은 대표 주소를 가리키는지 확인합니다.",
            "한 문서가 하나의 중심 질문에 답하고 관련 주제를 설명하는 다른 페이지와 자연스럽게 연결되도록 구성합니다.",
            "개선필요 항목을 수집 차단, 주제 불명확, 신뢰 부족, 전송 지연으로 나눈 뒤 영향이 큰 항목부터 수정하고 같은 URL을 재점검합니다.",
        ],
        "summary": ["기술 SEO와 콘텐츠 SEO를 분리하지 않고 함께 봅니다.", "대표 URL·제목·본문·내부 링크의 주제를 일치시킵니다.", "공개 URL을 진단하고 수정 뒤 같은 기준으로 재확인합니다."],
    },
    "geo": {
        "ko": "GEO",
        "label": "생성형엔진 최적화",
        "lead": "GEO는 생성형 검색과 AI 답변이 업체, 사람, 서비스, 주장과 근거를 구분하고 필요한 내용을 인용하기 쉽게 만드는 접근입니다.",
        "section_titles": ["GEO에서 확인하는 공개 신호", "업체·저자·콘텐츠 엔티티", "인용하기 쉬운 근거와 문장", "발견 경로와 점검 방법"],
        "axis_paragraphs": [
            "공식 단일 점수가 아니라 대표 URL, 엔티티 연결, 작성자·수정일, 출처, 정책 페이지와 AI 크롤러 접근 같은 공개 신호를 종합해 봅니다.",
            "Organization, Person, WebSite와 Article의 @id 관계를 연결하고 화면에 보이는 상호·대표자·연락처와 구조화 데이터가 일치하게 만듭니다.",
            "문단마다 주어와 결론을 분명히 쓰고 수치에는 조건과 기준일을, 외부 주장은 확인 가능한 공식 출처를 가까이 제공합니다.",
            "sitemap.xml, RSS, 내부 링크와 llms.txt는 공개 콘텐츠 발견을 돕는 보조 경로입니다. 실제 인용은 보장되지 않으므로 공개 신호와 콘텐츠 품질을 함께 개선합니다.",
        ],
        "summary": ["업체·저자·웹사이트의 관계를 일관되게 표시합니다.", "주장 가까이에 조건·기준일·공식 출처를 제공합니다.", "AI 인용 보장이 아닌 공개 신호의 준비 상태를 점검합니다."],
    },
    "aeo": {
        "ko": "AEO",
        "label": "답변엔진 최적화",
        "lead": "AEO는 사용자의 질문과 그에 대한 직접 답변을 명확히 배치해 검색과 AI 답변 환경이 핵심 내용을 추출하기 쉽게 만드는 접근입니다.",
        "section_titles": ["AEO가 필요한 질문 찾기", "첫 문단에서 직접 답하기", "의미 있는 HTML과 FAQ", "답변 품질을 점검하는 기준"],
        "axis_paragraphs": [
            "고객 문의, 검색어와 상담 기록에서 실제 질문을 찾고 가격·기간·대상·방법처럼 의사결정에 필요한 질문부터 답합니다.",
            "질문형 제목 바로 아래에 짧고 완결된 결론을 제공한 뒤 예외 조건, 근거와 다음 행동을 이어 설명합니다.",
            "목록은 ul·ol, 용어 설명은 dl, 비교는 caption과 th가 있는 table을 사용합니다. FAQPage JSON-LD는 화면의 질문·답과 일치해야 합니다.",
            "답이 구체적인지, 기준일과 작성자가 있는지, 관련 상세 페이지와 출처로 이어지는지 확인하고 불필요한 반복 질문은 합칩니다.",
        ],
        "summary": ["실제 사용자가 묻는 질문을 제목으로 정리합니다.", "질문 바로 아래에서 결론을 먼저 답합니다.", "FAQ·표·목록의 화면 내용과 구조화 데이터를 일치시킵니다."],
    },
}


COMBO_NOTES = {
    ("webpage", "top-ranking"): "단일 웹페이지가 노릴 검색 질문을 하나 정하고 제목, 첫 문단, 사례와 내부 링크가 그 답을 완성하게 만듭니다.",
    ("webpage", "seo"): "웹페이지 SEO는 이 URL만의 title, h1, 본문, 이미지 설명과 canonical이 같은 주제를 말하는지 확인하는 작업입니다.",
    ("webpage", "geo"): "웹페이지 GEO는 한 문서 안에서 주장, 작성자, 기준일과 출처를 가까이 배치해 인용 단위를 분명히 만드는 데 초점을 둡니다.",
    ("webpage", "aeo"): "웹페이지 AEO는 특정 질문에 대한 짧은 결론과 상세 조건을 한 URL에서 완결하는 방식이 핵심입니다.",
    ("website", "top-ranking"): "웹사이트 상단노출은 개별 문서뿐 아니라 서비스·사례·가이드가 주제 묶음으로 연결되고 중요한 페이지가 충분한 내부 링크를 받는 구조가 필요합니다.",
    ("website", "seo"): "웹사이트 SEO는 도메인 전체의 수집 정책, URL 중복, 사이트맵, 탐색 구조와 페이지 역할을 함께 정리합니다.",
    ("website", "geo"): "웹사이트 GEO는 회사소개, 연락처, 정책, 저자 페이지와 콘텐츠가 같은 조직·사람·서비스 관계를 일관되게 설명하도록 만듭니다.",
    ("website", "aeo"): "웹사이트 AEO는 여러 질문을 한 페이지에 몰지 않고 주제별 답변 페이지로 나눈 뒤 허브와 내부 링크로 연결합니다.",
    ("homepage", "top-ranking"): "홈페이지 상단노출은 브랜드명과 핵심 서비스 탐색에는 중요하지만 세부 질문은 해당 서비스·가이드 페이지가 답하도록 역할을 나누는 것이 좋습니다.",
    ("homepage", "seo"): "홈페이지 SEO는 대표 URL, 업체명, 핵심 서비스, 주요 탐색과 신뢰 정보를 명확히 제시해 사이트 전체의 출발점을 설명합니다.",
    ("homepage", "geo"): "홈페이지 GEO는 Organization과 WebSite 엔티티, 상호·대표자·주소·연락처와 핵심 서비스의 관계를 가장 분명하게 보여주는 데 초점을 둡니다.",
    ("homepage", "aeo"): "홈페이지 AEO는 방문자가 처음 묻는 서비스 대상, 비용 범위, 기간과 상담 방법을 직접 답하고 더 자세한 페이지로 안내합니다.",
}


def make_cluster_guides():
    pages = []
    for noun_key, noun in NOUNS.items():
        for axis_key, axis in AXES.items():
            phrase = f"{noun['ko']} {axis['ko']}"
            title_tail = {
                "top-ranking": "검색 상단에 보이기 위해 준비할 것",
                "seo": "수집·색인·본문을 점검하는 기준",
                "geo": "AI 검색이 이해하고 인용하기 쉬운 구조",
                "aeo": "질문에 바로 답하는 콘텐츠 설계",
            }[axis_key]
            topic_particle = "을" if axis_key == "top-ranking" else "를"
            description = f"{phrase}{topic_particle} 준비할 때 확인할 기술 구조, 콘텐츠, 내부 링크와 진단 기준을 {noun['scope']} 관점에서 설명합니다."
            intro = f"{COMBO_NOTES[(noun_key, axis_key)]} {axis['lead']}"
            sections = []
            for index, heading in enumerate(axis["section_titles"]):
                paragraph = axis["axis_paragraphs"][index]
                if index == 0:
                    paragraph = f"{noun['difference']} {paragraph}"
                elif index == 1:
                    paragraph = f"이 글에서 말하는 {noun['ko']} 범위는 {noun['scope']}입니다. {paragraph}"
                elif index == 2:
                    paragraph = f"{COMBO_NOTES[(noun_key, axis_key)]} {paragraph}"
                else:
                    paragraph = f"{noun['risk']} {paragraph}"
                bullets = noun["checks"] if index == 1 else []
                sections.append((heading, [paragraph], bullets))
            faq = [
                (f"{phrase}만 잘하면 바로 순위나 인용이 오르나요?", "아닙니다. 공개 구조와 콘텐츠의 준비 상태를 개선할 수 있지만 실제 노출과 인용은 경쟁 문서, 질문, 검색 서비스 정책과 시점에 따라 달라집니다."),
                (f"{noun['ko']}와 다른 페이지는 어떻게 연결해야 하나요?", f"{noun['ko']}의 역할을 분명히 하고 관련 서비스·사례·가이드로 설명형 내부 링크를 제공해야 합니다. 같은 검색 의도를 여러 URL이 반복하지 않게 정리합니다."),
                ("수정 전후를 어떻게 확인하나요?", "같은 공개 URL을 SEO 체커로 재점검하고 네이버 서치어드바이저와 Google Search Console의 수집·색인·노출 데이터를 함께 확인합니다."),
            ]
            pages.append(guide(f"{noun_key}-{axis_key}", f"{phrase}, {title_tail}", description, intro, axis["summary"], sections, faq))
    return pages


CLUSTER_GUIDES = make_cluster_guides()
ALL_GUIDES = SERVICE_GUIDES + CHECKER_GUIDES + CLUSTER_GUIDES


def esc(value):
    return html.escape(str(value), quote=True)


def render_header(active):
    about_active = ' class="active"' if active == "about" else ""
    checker_active = ' class="tool-pill active"' if active == "seochecker" else ' class="tool-pill"'
    return f'''<a class="skip-link" href="#content">본문으로 바로가기</a>
<div class="grid-bg"></div><div class="scan"></div><div class="hud" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<header id="header"><div class="pill"><a class="logo" href="index.html" aria-label="제닐로 홈"><span>Studio <em>Genilo</em></span><span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span></a><nav class="links" aria-label="주요 메뉴"><a href="about.html"{about_active}>회사소개</a><a href="portfolio.html">제작 사례</a><a href="insights.html">검색 가이드</a><a href="contact.html">상담하기</a></nav><div class="hright"><a{checker_active} href="seochecker.html"><span>SEO·AEO·GEO 체커</span></a><a class="chat-pill" href="https://open.kakao.com/o/sACnsFNi" target="_blank" rel="noopener noreferrer"><span>카카오톡 무료 상담</span></a><button class="menu-btn" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mobileMenu" id="menuBtn">☰</button></div></div></header>
<nav class="mobile-menu" id="mobileMenu" aria-label="모바일 메뉴" aria-hidden="true" inert><a href="index.html"><span>01</span>홈</a><a href="about.html"><span>02</span>회사소개</a><a href="insights.html"><span>03</span>검색 가이드</a><a href="seochecker.html"><span>04</span>SEO 체커</a><a href="contact.html"><span>05</span>상담하기</a></nav>
<aside class="scroll-meter" aria-hidden="true"><span class="rail"><span class="tick" id="tick"></span></span><span id="scrollPct">000%</span></aside>'''


def render_footer(kind):
    mobile = '<a class="btn outline" href="insights.html">검색 가이드</a><a class="btn primary" href="seochecker.html#checker">무료 SEO 점검</a>' if kind == "checker" else '<a class="btn outline" href="about.html">회사소개</a><a class="btn primary" href="contact.html">제작 상담</a>'
    return f'''<footer><div class="wrap"><div class="foot-top"><div class="foot-logo">Studio <em>Genilo</em></div><nav class="foot-nav" aria-label="하단 메뉴"><a href="index.html">홈</a><a href="about.html">회사소개</a><a href="insights.html">검색 가이드</a><a href="seochecker.html">SEO 체커</a><a href="contact.html">상담하기</a></nav></div><div class="biz"><span><i>상호</i>에이아이 스튜디오 제닐로</span><span><i>대표자</i>문지석</span><span><i>사업자등록번호</i>846-11-03049</span><span><i>전화</i>010-4819-3459</span><span><i>이메일</i>nbh3459@gmail.com</span><span><i>주소</i>서울특별시 마포구 만리재로6길 3-20 (공덕동)</span></div><div class="copy"><span>© Studio Genilo. All rights reserved.</span><span>제닐로 · WEB DESIGN &amp; SEARCH</span></div></div></footer><nav class="mobile-bar" aria-label="빠른 메뉴">{mobile}</nav><script src="guide.js?v=20261017"></script>'''


def schema_for(page):
    url = f"{BASE}/{page['slug']}.html"
    faq_items = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in page["faq"]]
    graph = [
        {"@type": "WebSite", "@id": f"{BASE}/#website", "url": f"{BASE}/", "name": "제닐로", "alternateName": ["Studio Genilo", "스튜디오 제닐로"], "inLanguage": "ko-KR"},
        {"@type": "Article", "@id": f"{url}#article", "headline": page["title"], "description": page["description"], "url": url, "mainEntityOfPage": {"@id": f"{url}#webpage"}, "datePublished": PUBLISHED, "dateModified": PUBLISHED, "inLanguage": "ko-KR", "author": {"@id": f"{BASE}/#representative"}, "publisher": {"@id": f"{BASE}/#business"}},
        {"@type": "WebPage", "@id": f"{url}#webpage", "url": url, "name": page["title"], "isPartOf": {"@id": f"{BASE}/#website"}, "about": {"@id": f"{url}#article"}, "inLanguage": "ko-KR"},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "홈", "item": f"{BASE}/"}, {"@type": "ListItem", "position": 2, "name": "검색 가이드", "item": f"{BASE}/insights.html"}, {"@type": "ListItem", "position": 3, "name": page["title"], "item": url}]},
        {"@type": "FAQPage", "@id": f"{url}#faq", "mainEntity": faq_items},
        {"@type": "ProfessionalService", "@id": f"{BASE}/#business", "name": "제닐로", "alternateName": ["Studio Genilo", "에이아이 스튜디오 제닐로"], "url": f"{BASE}/", "telephone": "+82-10-4819-3459", "email": "nbh3459@gmail.com", "address": {"@type": "PostalAddress", "streetAddress": "만리재로6길 3-20 (공덕동)", "addressLocality": "마포구", "addressRegion": "서울특별시", "addressCountry": "KR"}},
        {"@type": "Person", "@id": f"{BASE}/#representative", "name": "문지석", "jobTitle": "대표 · 웹 기획 및 제작 책임자", "worksFor": {"@id": f"{BASE}/#business"}},
    ]
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":"))


def related_pages(page):
    if page["kind"] == "service":
        pool = SERVICE_GUIDES
    elif page in CLUSTER_GUIDES:
        noun = page["slug"].split("-")[0]
        same_noun = [item for item in CLUSTER_GUIDES if item["slug"].startswith(noun + "-") and item is not page]
        pool = same_noun + CHECKER_GUIDES + CLUSTER_GUIDES
    else:
        pool = CHECKER_GUIDES + CLUSTER_GUIDES
    result = []
    for candidate in pool:
        if candidate is page or candidate in result:
            continue
        result.append(candidate)
        if len(result) == 3:
            break
    return result


def render_guide(page):
    active = "about" if page["kind"] == "service" else "seochecker"
    page_label = "홈페이지 제작 가이드" if page["kind"] == "service" else "SEO·GEO·AEO 검색 가이드"
    primary_href = "about.html" if page["kind"] == "service" else "seochecker.html#checker"
    primary_label = "제닐로 제작 방식 보기" if page["kind"] == "service" else "무료 SEO 체커에서 점검하기"
    secondary_href = "index.html" if page["kind"] == "service" else "insights.html"
    secondary_label = "제닐로 메인으로" if page["kind"] == "service" else "검색 가이드 더 보기"
    url = f"{BASE}/{page['slug']}.html"
    toc = ''.join(f'<a href="#section-{index + 1}">{esc(section[0])}</a>' for index, section in enumerate(page["sections"])) + '<a href="#faq">자주 묻는 질문</a>'
    sections = []
    for index, (heading, paragraphs, bullets) in enumerate(page["sections"]):
        paragraph_html = ''.join(f'<p>{esc(paragraph)}</p>' for paragraph in paragraphs)
        bullets_html = '<ul>' + ''.join(f'<li>{esc(item)}</li>' for item in bullets) + '</ul>' if bullets else ''
        if page["kind"] != "service" and index == 2:
            bullets_html += '<div class="guide-note"><strong>직접 확인하기</strong>이 항목은 공개 URL을 <a href="seochecker.html#checker">Studio Genilo SEO 체커</a>에 입력해 네이버 SEO·구글 SEO·AEO·GEO 결과로 나눠 볼 수 있습니다.</div>'
        sections.append(f'<section id="section-{index + 1}" class="reveal"><h2>{esc(heading)}</h2>{paragraph_html}{bullets_html}</section>')
    faq_html = ''.join(f'<li><h3>{esc(question)}</h3><p>{esc(answer)}</p></li>' for question, answer in page["faq"])
    summary_html = ''.join(f'<li>{esc(item)}</li>' for item in page["summary"])
    related = ''.join(f'<a href="{item["slug"]}.html"><small>{"제작" if item["kind"] == "service" else "검색 가이드"}</small><strong>{esc(item["title"])}</strong></a>' for item in related_pages(page))
    return f'''<!doctype html>
<html lang="ko" style="color-scheme:dark">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#06060a"><meta name="referrer" content="strict-origin-when-cross-origin">
<title>{esc(page['title'])} | 제닐로</title><meta name="description" content="{esc(page['description'])}"><meta name="application-name" content="제닐로">
<link rel="canonical" href="{url}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta property="og:type" content="article"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="제닐로"><meta property="og:title" content="{esc(page['title'])}"><meta property="og:description" content="{esc(page['description'])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(page['title'])}"><meta name="twitter:description" content="{esc(page['description'])}"><meta name="twitter:image" content="{BASE}/og-image.jpg">
<link href="fonts.css" rel="stylesheet"><link href="site.css?v=20261016f" rel="stylesheet"><link href="cyber.css?v=20261016d" rel="stylesheet"><link href="guide.css?v=20261017" rel="stylesheet"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap" rel="stylesheet">
<script type="application/ld+json">{schema_for(page)}</script>
</head>
<body class="guide-page" data-theme="dark" data-page="{active}">{render_header(active)}
<main id="content"><article>
<header class="guide-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="index.html">홈</a><span aria-hidden="true">/</span><a href="insights.html">검색 가이드</a><span aria-hidden="true">/</span><span aria-current="page">{esc(page_label)}</span></nav><h1>{esc(page['title'])}</h1><p class="intro">{esc(page['intro'])}</p><div class="guide-meta"><span><strong>작성·검토</strong> 문지석 대표</span><span><strong>수정일</strong> <time datetime="{PUBLISHED}">2026년 10월 17일</time></span><span><strong>읽는 시간</strong> 약 5분</span></div></div></header>
<div class="guide-main"><div class="wrap guide-layout"><nav class="guide-toc" aria-label="글 목차"><strong>이 글에서 확인할 내용</strong>{toc}</nav><div class="guide-prose"><div class="guide-summary reveal"><strong>먼저 확인할 핵심</strong><ul>{summary_html}</ul></div>{''.join(sections)}<section id="faq" class="reveal"><h2>자주 묻는 질문</h2><ul class="guide-faq">{faq_html}</ul></section><div class="guide-cta reveal"><h2>{'제작 방향을 회사소개에서 이어서 확인하세요.' if page['kind'] == 'service' else '지금 공개 URL의 상태를 직접 확인하세요.'}</h2><p>{'제닐로의 제작 원칙과 범위, 비용 안내를 확인한 뒤 프로젝트 상담으로 이어갈 수 있습니다.' if page['kind'] == 'service' else '주소 하나를 입력하면 네이버 SEO·구글 SEO·AEO·GEO의 강점, 주의 항목과 개선 방법을 나눠 보여드립니다.'}</p><div class="hero-actions"><a class="btn primary" href="{primary_href}">{primary_label}</a><a class="btn outline" href="{secondary_href}">{secondary_label}</a></div></div></div></div></div>
</article></main>
<section class="related-guides" aria-labelledby="relatedTitle"><div class="wrap"><div class="related-head"><h2 id="relatedTitle">함께 읽을 가이드</h2><a href="insights.html">전체 가이드 보기</a></div><div class="related-list">{related}</div></div></section>{render_footer(page['kind'])}</body></html>'''


def render_hub():
    groups = [
        ("홈페이지 제작", "제작 목적과 운영 방식에 맞는 사이트 유형을 확인합니다.", SERVICE_GUIDES),
        ("SEO 체커 해설", "점수·지수·속도와 개선 우선순위를 읽는 기준입니다.", CHECKER_GUIDES),
        ("웹페이지 검색 전략", "단일 URL의 상단노출·SEO·GEO·AEO를 구분합니다.", [page for page in CLUSTER_GUIDES if page["slug"].startswith("webpage-")]),
        ("웹사이트 검색 전략", "도메인 전체 구조의 상단노출·SEO·GEO·AEO를 정리합니다.", [page for page in CLUSTER_GUIDES if page["slug"].startswith("website-")]),
        ("홈페이지 검색 전략", "대표 진입 페이지의 상단노출·SEO·GEO·AEO를 설명합니다.", [page for page in CLUSTER_GUIDES if page["slug"].startswith("homepage-")]),
    ]
    group_html = []
    for title, description, pages in groups:
        links = ''.join(f'<a href="{page["slug"]}.html"><strong>{esc(page["title"])}</strong><span>{"회사소개·메인 연결" if page["kind"] == "service" else "무료 SEO 체커 연결"}</span></a>' for page in pages)
        group_html.append(f'<section class="hub-group"><header><h2>{esc(title)}</h2><p>{esc(description)}</p></header><div class="hub-links">{links}</div></section>')
    item_list = [{"@type": "ListItem", "position": index + 1, "url": f"{BASE}/{page['slug']}.html", "name": page["title"]} for index, page in enumerate(ALL_GUIDES)]
    schema = json.dumps({"@context": "https://schema.org", "@graph": [{"@type": "WebSite", "@id": f"{BASE}/#website", "url": f"{BASE}/", "name": "제닐로", "alternateName": ["Studio Genilo", "스튜디오 제닐로"], "inLanguage": "ko-KR"}, {"@type": "CollectionPage", "@id": f"{BASE}/insights.html#webpage", "url": f"{BASE}/insights.html", "name": "제닐로 홈페이지 제작·SEO·GEO·AEO 가이드", "description": "홈페이지 제작과 네이버·구글 SEO, GEO, AEO, 상단노출을 주제별로 정리한 공개 가이드입니다.", "isPartOf": {"@id": f"{BASE}/#website"}, "mainEntity": {"@type": "ItemList", "itemListElement": item_list}}]}, ensure_ascii=False, separators=(",", ":"))
    return f'''<!doctype html><html lang="ko" style="color-scheme:dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#06060a"><meta name="referrer" content="strict-origin-when-cross-origin"><title>홈페이지 제작·SEO·GEO·AEO 검색 가이드 | 제닐로</title><meta name="description" content="웹페이지·웹사이트·홈페이지 상단노출, SEO, GEO, AEO와 제작 유형을 주제별 독립 페이지로 정리한 제닐로 검색 가이드입니다."><meta name="application-name" content="제닐로"><link rel="canonical" href="{BASE}/insights.html"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="제닐로"><meta property="og:title" content="홈페이지 제작·SEO·GEO·AEO 검색 가이드"><meta property="og:description" content="제작과 검색 최적화 주제를 독립적인 글로 확인하고 무료 SEO 체커로 이어서 점검하세요."><meta property="og:url" content="{BASE}/insights.html"><meta property="og:image" content="{BASE}/og-image.jpg"><meta name="twitter:card" content="summary_large_image"><link href="fonts.css" rel="stylesheet"><link href="site.css?v=20261016f" rel="stylesheet"><link href="cyber.css?v=20261016d" rel="stylesheet"><link href="guide.css?v=20261017" rel="stylesheet"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap" rel="stylesheet"><script type="application/ld+json">{schema}</script></head><body class="guide-page" data-theme="dark" data-page="seochecker">{render_header('seochecker')}<main id="content"><header class="guide-hero hub-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="현재 위치"><a href="index.html">홈</a><span aria-hidden="true">/</span><span aria-current="page">검색 가이드</span></nav><h1>제작과 검색 개선을<br>주제별로 읽는 가이드</h1><p class="intro">홈페이지 제작부터 웹페이지·웹사이트·홈페이지의 상단노출, SEO, GEO, AEO까지 서로 다른 검색 의도를 독립적인 글로 정리했습니다. SEO 관련 글은 무료 체커로, 제작 관련 글은 회사소개와 상담으로 이어집니다.</p><div class="guide-meta"><span><strong>공개 글</strong> {len(ALL_GUIDES)}개</span><span><strong>수정일</strong> <time datetime="{PUBLISHED}">2026년 10월 17일</time></span></div></div></header><div class="hub-groups"><div class="wrap">{''.join(group_html)}</div></div></main>{render_footer('checker')}</body></html>'''


def write_sitemap():
    static_pages = ["", "about.html", "portfolio.html", "contact.html", "pricing.html", "process.html", "privacy.html", "terms.html", "seochecker.html", "insights.html", "llms.txt", "llms-full.txt"]
    urls = static_pages + [f"{page['slug']}.html" for page in ALL_GUIDES]
    rows = [f"  <url><loc>{BASE}/{' ' if path == '' else esc(path)}</loc><lastmod>{PUBLISHED}</lastmod></url>".replace("/ </loc>", "/</loc>") for path in urls]
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(rows) + '\n</urlset>\n', encoding="utf-8", newline="\n")


def write_rss():
    featured = CLUSTER_GUIDES + CHECKER_GUIDES[:4] + SERVICE_GUIDES[:4]
    items = []
    for page in featured:
        url = f"{BASE}/{page['slug']}.html"
        items.append(f'''    <item><title>{esc(page['title'])}</title><link>{url}</link><guid isPermaLink="true">{url}</guid><pubDate>Sat, 17 Oct 2026 00:00:00 +0900</pubDate><description><![CDATA[{page['description']}]]></description></item>''')
    rss = f'''<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>제닐로 검색·제작 가이드</title><link>{BASE}/insights.html</link><description>홈페이지 제작, 네이버·구글 SEO, AEO·GEO와 무료 점검 가이드입니다.</description><language>ko-KR</language><lastBuildDate>Sat, 17 Oct 2026 00:00:00 +0900</lastBuildDate><atom:link href="{BASE}/rss.xml" rel="self" type="application/rss+xml" />\n{chr(10).join(items)}\n  </channel></rss>\n'''
    (ROOT / "rss.xml").write_text(rss, encoding="utf-8", newline="\n")


def main():
    for page in ALL_GUIDES:
        (ROOT / f"{page['slug']}.html").write_text(render_guide(page), encoding="utf-8", newline="\n")
    hub_html = render_hub().replace("<h1>제작과 검색 개선을<br>주제별로 읽는 가이드</h1>", "<h1>제작과 검색 개선을 주제별로 읽는 가이드</h1>")
    (ROOT / "insights.html").write_text(hub_html, encoding="utf-8", newline="\n")
    write_sitemap()
    write_rss()
    print(f"generated {len(ALL_GUIDES)} guides + insights.html")


if __name__ == "__main__":
    main()
