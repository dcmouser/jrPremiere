XCOPY ..\..\jrlib staging\jrlib /i /s /e /y
CALL ../WinCleanFiles.bat
DEL jrlib.zxp
"C:\ProgramFiles\ZXPSignCmd\win64\ZXPSignCmd.exe" -sign staging\jrlib jrlib.zxp "E:\MyDocs\Programming\DonationCoderCodeSigning\zxpSignCmd\dcCertForAdobeExt.p12" initAlien -tsa http://time.certum.pl/