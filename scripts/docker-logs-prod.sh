#!/bin/bash

# Y-Blind 프로덕션 환경 로그 확인 스크립트

docker-compose -f docker-compose.prod.yml logs -f
