# Test signup
$headers = @{
    "Content-Type" = "application/json"
}

$signupBody = @{
    "username" = "newbanker"
    "email" = "newbanker@example.com"
    "password" = "newpassword123"
    "role" = "banker"
} | ConvertTo-Json

try {
    Write-Host "Testing signup..."
    $signupResponse = Invoke-WebRequest -Uri "http://localhost:52093/api/auth/signup" -Method POST -Headers $headers -Body $signupBody
    Write-Host "Signup Response:"
    Write-Host $signupResponse.Content
    
    # Test login
    $loginBody = @{
        "identifier" = "newbanker"
        "password" = "newpassword123"
    } | ConvertTo-Json

    Write-Host "Testing login..."
    $response = Invoke-WebRequest -Uri "http://localhost:52093/api/auth/login" -Method POST -Headers $headers -Body $loginBody
    Write-Host "Login Response:"
    Write-Host $response.Content

    # Parse the token
    $loginData = $response.Content | ConvertFrom-Json
    $token = $loginData.token

    if ($token) {
        Write-Host "Login successful, token received"
        
        # Test banker users endpoint
        $bankerHeaders = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:52093/api/banker/users" -Method GET -Headers $bankerHeaders
        Write-Host "Banker Users Response:"
        Write-Host $usersResponse.Content
    } else {
        Write-Host "Login failed"
    }
} catch {
    Write-Host "Error occurred:"
    Write-Host $_.Exception.Message
    Write-Host "Status Code:" $_.Exception.Response.StatusCode
    Write-Host "Response:"
    Write-Host $_.Exception.Response.GetResponseStream()
}