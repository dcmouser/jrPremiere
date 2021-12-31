XCOPY ..\..\TimeStamper staging\TimeStamper /i /s /e /y
CALL ../WinCleanFiles.bat
DEL TimeStamper.zxp
"C:\ProgramFiles\ZXPSignCmd\win64\ZXPSignCmd.exe" -sign staging\TimeStamper TimeStamper.zxp "E:\MyDocs\Programming\DonationCoderCodeSigning\zxpSignCmd\dcCertForAdobeExt.p12" initAlien -tsa http://time.certum.pl/