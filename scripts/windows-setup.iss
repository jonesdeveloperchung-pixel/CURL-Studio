[Setup]
AppName=CURL Studio
AppVersion=1.0.0
DefaultDirName={autopf}\CURL Studio
DefaultGroupName=CURL Studio
OutputDir=..\dist_final
OutputBaseFilename=CURL-Studio-Windows-Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\dist_standalone\CURL-Studio-win-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\CURL Studio"; Filename: "{app}\start.bat"
Name: "{autodesktop}\CURL Studio"; Filename: "{app}\start.bat"; Tasks: desktopicon

[Run]
Filename: "{app}\start.bat"; Description: "{cm:LaunchProgram,CURL Studio}"; Flags: shellexec postinstall nowait
