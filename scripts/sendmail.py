#!/usr/bin/python

#this is replacement for sendmail that php can use to send its goddamn emails

import smtplib
import sys

def findToAddress(lines):
    for i, val in enumerate(lines):
        j = val.index("To: ")
        if j != -1:
            return val[j+4:]
    return ""

fromaddr = 'ardefact@gmail.com'
lines = sys.stdin.readlines()
toaddrs = findToAddress(lines)
msg = ''.join(lines)

username = 'ardefact@gmail.com'
password = 'ciwudolmzoewoart'

# The actual mail send
server = smtplib.SMTP('smtp.gmail.com:25')
server.starttls()
try:
    server.login(username,password)
except:
    print "Couldn't login"
    raise
try:
    print "Sending email out to", toaddrs
    server.sendmail(fromaddr,toaddrs, msg)
except:
    print "Couldn't send email:", sys.exc_info()[0]
    raise
server.quit()