on run
  set appPath to POSIX path of (path to me)
  set sitePath to quoted form of ((do shell script "dirname " & quoted form of appPath) & "/../Resources/site/index.html")
  do shell script "open " & sitePath
end run
