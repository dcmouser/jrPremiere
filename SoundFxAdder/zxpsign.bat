XCOPY ..\..\SoundFxAdder staging\SoundFxAdder /i /s /e /y
CALL ../WinCleanFiles.bat
DEL SoundFxAdder.zxp
"C:\ProgramFiles\ZXPSignCmd\win64\ZXPSignCmd.exe" -sign staging\SoundFxAdder SoundFxAdder.zxp "E:\MyDocs\Programming\DonationCoderCodeSigning\zxpSignCmd\dcCertForAdobeExt.p12" initAlien -tsa http://time.certum.pl/