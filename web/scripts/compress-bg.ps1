Add-Type -AssemblyName System.Drawing

$inputPath = Join-Path $PSScriptRoot "..\public\images\bg.jpg"
$outputPath = Join-Path $PSScriptRoot "..\public\images\bg.jpg"
$tempPath = Join-Path $PSScriptRoot "..\public\images\bg_temp.jpg"

if (Test-Path $inputPath) {
    $img = [System.Drawing.Image]::FromFile($inputPath)
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoder = [System.Drawing.Imaging.Encoder]::Quality
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]75)
    
    $img.Save($tempPath, $codec, $encoderParams)
    $img.Dispose()
    
    Move-Item -Path $tempPath -Destination $outputPath -Force
    $fileInfo = Get-Item $outputPath
    Write-Host "Optimized bg.jpg size: $([math]::Round($fileInfo.Length / 1024, 1)) KB"
}
