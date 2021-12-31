XCOPY ..\..\MulticamDeluxe staging\MulticamDeluxe /i /s /e /y
CALL ../WinCleanFiles.bat
DEL MulticamDeluxe.zxp
"C:\ProgramFiles\ZXPSignCmd\win64\ZXPSignCmd.exe" -sign staging\MulticamDeluxe MulticamDeluxe.zxp "E:\MyDocs\Programming\DonationCoderCodeSigning\zxpSignCmd\dcCertForAdobeExt.p12" initAlien -tsa http://time.certum.pl/