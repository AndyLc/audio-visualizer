unamestr=`uname`
if [[ "$unamestr" == 'Linux' ]]; then
    sudo apt-get install tesseract-ocr
elif [[ "$unamestr" == 'Darwin' ]]; then
    brew install tesseract
fi
