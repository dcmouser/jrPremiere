XCOPY ..\..\cft staging\cft /i /s /e /y
CALL ../WinCleanFiles.bat
DEL cft.zxp
"C:\ProgramFiles\ZXPSignCmd\win64\ZXPSignCmd.exe" -sign staging\cft cft.zxp "E:\MyDocs\Programming\DonationCoderCodeSigning\zxpSignCmd\dcCertForAdobeExt.p12" initAlien -tsa http://time.certum.pl/