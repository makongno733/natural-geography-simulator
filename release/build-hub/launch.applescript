on run
  set appPosix to POSIX path of (path to me)
  set hubPath to appPosix & "Contents/Resources/site/hub.html"
  open location ("file://" & hubPath)
end run
