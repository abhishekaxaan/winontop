
$iconUrl = "https://cdn-icons-png.flaticon.com/512/3524/3524335.png" # Layers/Window Icon
$pngPath = "$PSScriptRoot\resources\logo.png"
$icoPath = "$PSScriptRoot\resources\icon.ico"

# Create resources dir if not exists
if (!(Test-Path "$PSScriptRoot\resources")) {
    New-Item -ItemType Directory -Force -Path "$PSScriptRoot\resources"
}

# Download PNG
Invoke-WebRequest -Uri $iconUrl -OutFile $pngPath

# Function to convert PNG to ICO
Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile($pngPath)
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# Write ICO Header
$bw.Write([int16]0)   # Reserved
$bw.Write([int16]1)   # Type (1=ICO)
$bw.Write([int16]1)   # Count

# Write Directory Entry
$w = $img.Width
$h = $img.Height
if ($w -ge 256) { $w = 0 }
if ($h -ge 256) { $h = 0 }
$bw.Write([byte]$w)
$bw.Write([byte]$h)
$bw.Write([byte]0)    # ColorCount
$bw.Write([byte]0)    # Reserved
$bw.Write([int16]1)   # Planes
$bw.Write([int16]32)  # BitCount

# Write PNG Data 
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$size = $pngBytes.Length

$bw.Write([int]$size) # SizeInBytes
$bw.Write([int]22)    # Offset (6+16)

# Write PNG content
$bw.Write($pngBytes)

# Save to File
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())

$img.Dispose()
$ms.Dispose()
$bw.Dispose()

Write-Host "Created icon.ico from logo.png successfully!"
