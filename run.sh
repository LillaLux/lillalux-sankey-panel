#!/bin/bash -f 
if [ "$1" -eq "01" ]; then
    sudo docker compose up  
fi
if [ "$1" -eq "02" ]; then
    #nvm install 22
    npm run dev 
fi
if [ "$1" -eq "03" ]; then
    codium . 
fi
