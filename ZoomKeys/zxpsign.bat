XCOPY ..\..\ZoomKeys staging\ZoomKeys /i /s /e /y
CALL ../WinCleanFiles.bat
DEL ZoomKeys.zxp
"C:\ProgramFiles\ZXPSignCmd\win64\ZXPSignCmd.exe" -sign staging\ZoomKeys ZoomKeys.zxp "E:\MyDocs\Programming\DonationCoderCodeSigning\zxpSignCmd\dcCertForAdobeExt.p12" initAlien -tsa http://time.certum.pl/