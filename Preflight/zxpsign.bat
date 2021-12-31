XCOPY ..\..\Preflight staging\Preflight /i /s /e /y
CALL ../WinCleanFiles.bat
DEL Preflight.zxp
"C:\ProgramFiles\ZXPSignCmd\win64\ZXPSignCmd.exe" -sign staging\Preflight Preflight.zxp "E:\MyDocs\Programming\DonationCoderCodeSigning\zxpSignCmd\dcCertForAdobeExt.p12" initAlien -tsa http://time.certum.pl/