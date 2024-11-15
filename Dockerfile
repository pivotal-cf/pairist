FROM node:18-buster

RUN apt-get update && \
  apt-get install -y \
  curl \
  g++ \
  python \
  make \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && \
  apt-get install --no-install-recommends -y yarn && \
  rm -rf /var/lib/apt/lists/*

RUN yarn global add firebase-tools@11.30.0

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ENV NODE_ENV=production
ENV PAIRIST_FIREBASE_PROJECT_ID=""
ENV PAIRIST_FIREBASE_API_KEY=""

RUN echo '#!/bin/bash\n\
  if [ -z "$PAIRIST_FIREBASE_PROJECT_ID" ] || [ -z "$PAIRIST_FIREBASE_API_KEY" ]; then\n\
  echo "Error: Required environment variables not set"\n\
  echo "Please set PAIRIST_FIREBASE_PROJECT_ID and PAIRIST_FIREBASE_API_KEY"\n\
  exit 1\n\
  fi\n\
  \n\
  # Configure Firebase project\n\
  firebase use $PAIRIST_FIREBASE_PROJECT_ID\n\
  \n\
  # Run deployment\n\
  yarn deploy\n\
  ' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
