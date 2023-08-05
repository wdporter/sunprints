function CheckNodeService ()
{

	$node = Get-Process node -ErrorAction SilentlyContinue

	if($node)
	{
			echo 'Node Running'
	}
	else
	{
			echo 'Node not Running'
			Start-Process "C:\Program Files\nodejs\node.exe" -ArgumentList "app.js" -WorkingDirectory "E:\MyApplication"
			echo 'Node started'
	}
}

CheckNodeService
