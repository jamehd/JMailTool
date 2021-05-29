$User = "Administrator"
$Password = ConvertTo-SecureString -String "NguyenQuyet@6798#$" -AsPlainText -Force
$Credential = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $User, $Password
$Session = New-PSSession -AllowRedirection -ConnectionUri http://135.148.104.49:5985/WSMAN -Credential $Credential -EnableNetworkAccess

Copy-Item –Path 'E:\Project\JMailTool\deploy\data.txt' –Destination 'C:\' –ToSession $Session

#Invoke-Command -Session $Session {$h = Remove-Item C:\data.txt}