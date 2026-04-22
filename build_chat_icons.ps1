$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

function New-CroppedIcon {
  param(
    [Parameter(Mandatory = $true)][string]$Src,
    [Parameter(Mandatory = $true)][string]$Dst,
    [Parameter(Mandatory = $true)][ValidateSet('black', 'white')]$Bg,
    [int]$OutSize = 256,
    [int]$Padding = 28
  )

  $img = [System.Drawing.Bitmap]::FromFile($Src)
  try {
    $w = $img.Width
    $h = $img.Height

    $minX = $w
    $minY = $h
    $maxX = 0
    $maxY = 0

    for ($y = 0; $y -lt $h; $y += 1) {
      for ($x = 0; $x -lt $w; $x += 1) {
        $c = $img.GetPixel($x, $y)

        if ($Bg -eq 'black') {
          $isBg = ($c.R -lt 18 -and $c.G -lt 18 -and $c.B -lt 18)
        } else {
          $isBg = ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245)
        }

        if (-not $isBg) {
          if ($x -lt $minX) { $minX = $x }
          if ($y -lt $minY) { $minY = $y }
          if ($x -gt $maxX) { $maxX = $x }
          if ($y -gt $maxY) { $maxY = $y }
        }
      }
    }

    if ($minX -ge $w -or $minY -ge $h) {
      throw "Không tìm được vùng icon trong: $Src"
    }

    $cropRect = [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)
    $cropped = $img.Clone($cropRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $canvas = New-Object System.Drawing.Bitmap $OutSize, $OutSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $g = [System.Drawing.Graphics]::FromImage($canvas)
        try {
          $g.Clear([System.Drawing.Color]::Transparent)
          $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
          $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

          $target = $OutSize - ($Padding * 2)
          $scale = [Math]::Min($target / $cropped.Width, $target / $cropped.Height)

          $dw = [int][Math]::Round($cropped.Width * $scale)
          $dh = [int][Math]::Round($cropped.Height * $scale)
          $dx = [int][Math]::Floor(($OutSize - $dw) / 2)
          $dy = [int][Math]::Floor(($OutSize - $dh) / 2)

          $g.DrawImage($cropped, $dx, $dy, $dw, $dh)
          $canvas.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
        } finally {
          $g.Dispose()
        }
      } finally {
        $canvas.Dispose()
      }
    } finally {
      $cropped.Dispose()
    }
  } finally {
    $img.Dispose()
  }
}

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

New-CroppedIcon `
  -Src 'C:\Users\trann\Downloads\logo-zalo-vector.png' `
  -Dst (Join-Path $baseDir 'zalo.png') `
  -Bg black

New-CroppedIcon `
  -Src 'C:\Users\trann\Downloads\Facebook-Messenger-Statistics-and-Facts-scaled.jpg' `
  -Dst (Join-Path $baseDir 'messenger.png') `
  -Bg white

Get-ChildItem -Path $baseDir -Filter '*.png' | Select-Object Name, Length

