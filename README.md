배송 관리 추적 시스템 CI/CD 자동화 배포

1. 제작 기간
 - 2025년 6월 04 ~ 2025년 6월 12일 (수정 기간 : 12 ~ 18일)

2. 참여 인원 (CI/CD 만)
 - 프론트엔드 1명, 백엔드 1명, CI/CD 공통

3. 사용한 기술
 - git, git Actions, React.js, JavaScript, css, Node.js + Express, pm2

CI/CD 자동화 배포로 git Actions를 사용하였고 배포되는 곳은 ALB로 연결된 AWS Ec2 web/was 각각 2대 씩이고 web - 프론트엔드 / was - 백엔드 로 배포하였습니다.

배포하는 툴로는 git Actions가 쓰였으며 .gitignore/workflows 파일에 deploy.yml 파일을 넣어 워크플로우를 실행시켰고
Ansible을 이용하여 각각의 web/was 에 프론트엔드/백엔드 파일을 구분하여 설치하였습니다.

deploy.yml, playbook.yml 에 있는 환경변수는 git secrets, variable 에 관리하였습니다.
