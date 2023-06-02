import { MailDecoder } from './lib/mail-decoder';

const input = `Delivered-To: nikitabort22092000@gmail.com
Received: by 2002:a05:6a10:f504:b0:4bc:e433:bd4e with SMTP id l4csp215291pxx;
        Sat, 20 May 2023 05:52:57 -0700 (PDT)
X-Google-Smtp-Source: ACHHUZ4ALxCr5kDZuSfkFrXhokJfqX5h7Jj78eceIaegLwjosiFNu4ngMQPrhdoW02SfCRSpZVB/
X-Received: by 2002:ad4:5ec8:0:b0:621:48be:bab5 with SMTP id jm8-20020ad45ec8000000b0062148bebab5mr10102329qvb.8.1684587177388;
        Sat, 20 May 2023 05:52:57 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1684587177; cv=none;
        d=google.com; s=arc-20160816;
        b=lQAVJsXnqYFBYyN1L8+GkofK8RhyyS4G2FFgiAkU1BFFiuF8CzvkY8AR7G5QYOgIo7
         9HKSoUyTm1gCxtl+KjC61WD8GeR/JUVdwZ4sZYKHXE7mRp+SKAxG3N9cUTzM8piyBgbn
         YZXC7ECcLdX5EsJwH8FIxthXSQoND4QCvaEr9/VTTyVkIBcU52AZ5LxgTvyjyeASvF6c
         qZeTZFAcirp3OERoD8KybjsPa8wOE8pk2SFs4cga+HoVQNg10J5fjlcSbCdDgTMV6tD9
         5m/LubiHOyGzIeaDchrELOBFt0JZ71vEsTKg1DgB/ObZyMoxlCIXweGWOBb0PkWBxtgT
         Rt7w==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;
        h=list-unsubscribe:to:reply-to:subject:message-id:mime-version:from
         :date:dkim-signature:dkim-signature;
        bh=FJQsGELaWCCY4iB1OYWqt6T9Y+W1qPlQVLb/VWYw0Mo=;
        b=NhIfvWXaot6USmGRDnSXwlqHU3QHZu/ADT1BpQJ0FEkuUx/pVNptuJXrbaUdGXiDa5
         bq3SosZiFQBco4s0FholNItzmUKzeIn7iB5E3O9eF/E2QxUYmL/M9XmDzfL3MCXiNOV5
         /TmRSPMfDpXjrV0XT/hDGShzKwOMK/JrOQl4eg5poXe/HUDY2qcA0XSzeY+nY38VIK+p
         u5/cLFBFdy+VkLwjt29oRbkHac6VeG2Bi4y1d//rEEg8elF8a3PPdxOMHiIWzQCtSlw8
         /WlYOntFDWCKJ+vKKP9otVyI+aoO/eRoFy5hgO+wrV19JLfDPCUd9jJ62gliiOa/UGr2
         ZWAQ==
ARC-Authentication-Results: i=1; mx.google.com;
       dkim=pass header.i=@m.fontawesome.com header.s=s1 header.b=DZsqfA2s;
       dkim=pass header.i=@sendgrid.info header.s=smtpapi header.b=McECtYbT;
       spf=pass (google.com: domain of bounces+24655962-eea9-nikitabort22092000=gmail.com@em.m.fontawesome.com designates 159.183.136.94 as permitted sender) smtp.mailfrom="bounces+24655962-eea9-nikitabort22092000=gmail.com@em.m.fontawesome.com";
       dmarc=pass (p=QUARANTINE sp=QUARANTINE dis=NONE) header.from=fontawesome.com
Return-Path: <bounces+24655962-eea9-nikitabort22092000=gmail.com@em.m.fontawesome.com>
Received: from o2.ptr5237.m.fontawesome.com (o2.ptr5237.m.fontawesome.com. [159.183.136.94])
        by mx.google.com with ESMTPS id fv9-20020a056214240900b0061b7b4c78bdsi926348qvb.558.2023.05.20.05.52.56
        for <nikitabort22092000@gmail.com>
        (version=TLS1_3 cipher=TLS_AES_128_GCM_SHA256 bits=128/128);
        Sat, 20 May 2023 05:52:57 -0700 (PDT)
Received-SPF: pass (google.com: domain of bounces+24655962-eea9-nikitabort22092000=gmail.com@em.m.fontawesome.com designates 159.183.136.94 as permitted sender) client-ip=159.183.136.94;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@m.fontawesome.com header.s=s1 header.b=DZsqfA2s;
       dkim=pass header.i=@sendgrid.info header.s=smtpapi header.b=McECtYbT;
       spf=pass (google.com: domain of bounces+24655962-eea9-nikitabort22092000=gmail.com@em.m.fontawesome.com designates 159.183.136.94 as permitted sender) smtp.mailfrom="bounces+24655962-eea9-nikitabort22092000=gmail.com@em.m.fontawesome.com";
       dmarc=pass (p=QUARANTINE sp=QUARANTINE dis=NONE) header.from=fontawesome.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=m.fontawesome.com; h=content-type:from:mime-version:subject:reply-to:x-feedback-id:to: list-unsubscribe:cc:content-type:from:subject:to; s=s1; bh=FJQsGELaWCCY4iB1OYWqt6T9Y+W1qPlQVLb/VWYw0Mo=; b=DZsqfA2sXnLDJaT/fWgTMKkS9Ph8TKiqPLEAFfiWkQ7k42z1gyfQt12x1rdC9ptAHPcC owRhfhaaTLLLPtspZM5/gCb2TiJkoSOtts1qgDxryqY+Lxt+cyjWh6r7hEYo34FDgth8AA WgqLHeDrI6WovHpWhnYe3UK2S10ycyQPevp9Fc88ARw7umSpbHxTdUzvMtiM/5pZBtKs2k GLtBdq67MMl7e6QvrsPMXTIXhPERfYuCHTmZqwSwwLx8zxJAsgE/v/A9oIz88faI0Ksd3j TFsQ4HC66PGt4JzJMDKFL1ZcAwnbq3juSefM2JvEfnEejbZ8Ia2pgi4bTWqtWO4A==
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=sendgrid.info; h=content-type:from:mime-version:subject:reply-to:x-feedback-id:to: list-unsubscribe:cc:content-type:from:subject:to; s=smtpapi; bh=FJQsGELaWCCY4iB1OYWqt6T9Y+W1qPlQVLb/VWYw0Mo=; b=McECtYbT68EjLFnCqx60AU9IC2s017YT7CSHzptE2e1BhvTCj/9tMDFQCZEjchRZBdUF +XtkuNtnlfCQ2vapB2BxZM7aPQR1VSe7+gOqS1P76f7h37wfHTqUGb+fgFLByI04x+mWif jBiu8wa/52NmyANmkqG03doCwXhAPVdxE=
Received: by filterdrecv-7bd468c8f9-bh7t7 with SMTP id filterdrecv-7bd468c8f9-bh7t7-1-64679512-C0
        2023-05-19 15:26:10.764198012 +0000 UTC m=+747982.473824905
Received: from MjQ2NTU5NjI (unknown) by geopod-ismtpd-32 (SG) with HTTP id FDzW9JZDS_61M_j-KqhY1g Fri, 19 May 2023 15:26:10.713 +0000 (UTC)
Content-Type: multipart/alternative; boundary=ecd313dfa965850cdebcd66b5ebb93067df18822eb34d9872053ae07c994
Date: Fri, 19 May 2023 15:26:36 +0000 (UTC)
From: Jory at Font Awesome <jory@m.fontawesome.com>
Mime-Version: 1.0
Message-ID: <FDzW9JZDS_61M_j-KqhY1g@geopod-ismtpd-32>
Subject: Awesome News - May Edition
Reply-To: Font Awesome <marketing@fontawesome.com>
X-Feedback-ID: 24655962:SG
X-SG-EID: ifWJaD7A06+W1kmirQ5/oYAT11e//qDCCEUT/ENZiXqqoQoPFD0ibCA1xUQPyFK4C/lt/q4lIs+ZtQDRyNoGY9Bvl4ecUHr3VAed27tmLEXxvwtkppLW1B+9ZFXxH7r+TnTZFPX9A4Xd/O99BjRh9vSH0xIVEAMZgUySrQakDPnbO5ZHtfzZsMfvHFHEGegyya6pSKD0PtJP7vph94ix5rxTK1YtNlBRn/0++MLu38dXcJRtu8QlicGtgWhek5JGB79b+b2dR4mbcOLEyOmVgA==
To: nikitabort22092000@gmail.com
X-Entity-ID: RBB6buBjHW9QKFKH52K4Xg==
List-Unsubscribe: <mailto:unsubscribe@em.m.fontawesome.com?subject=http://link.m.fontawesome.com/wf/unsubscribe*q*upn=TgaBL0U-2BVojh6stGbNMGVxhNKydRP6Xknl-2B8-2Fvmv0aKciQjjKtQp1H6JmRA2xy9zpd8vMuPECQO0Dze09DDumOl39Lmpt4NE2nBPapMr-2Bpc6w4nCdYZobddZgyikTVJYKX-2BouMzbNEmhjNCBJOIj1V8xf2iVbAkZ6Bqc-2F7aVEXgthDuLWShKlzDp8rUXaaa5mxqBN2S05HNHy0fyjBIpUc1kLaMyaLIiGgQuZ-2BojT5dJeqE8f6iRIeB4AfvfJiX3>

--ecd313dfa965850cdebcd66b5ebb93067df18822eb34d9872053ae07c994
Content-Transfer-Encoding: quoted-printable
Content-Type: text/plain; charset=utf-8
Mime-Version: 1.0

Hey there, folks. Spring has sprung. But did February like March? No, but A=
pril May.

And while we're on the subject of gardening, we did start planting the seed=
s of a new podcast, so we hope it=E2=80=99s growing on you!

[Editor's Note: Apologies for leaning into the dad jokes so early in this e=
mail.]

----------------------------------------

NERD IT UP WITH US AT PODCAST AWESOME

We're not ashamed to admit it. We're nerds =E2=80=94 but you know, the kind=
 of nerds who like people. On season 1 of the podcast, we couldn't wait to =
introduce you to the Font Awesome team. And what better way to get acquaint=
ed than our Nerd Show and Tell?

 * Meet Head of Security Alex Poiry [https://www.podcastawesome.com/2092855=
/12487143-nerd-show-and-tell-meet-alex-poiry] - Ask Alex to stop making suc=
h corny security jokes around the office, and he'll tell you he can't hack =
it. And how is VR and traditional European martial arts connected? You'll n=
eed to listen to find out.
  =20
 * Meet Sr. Developer Ed Emanuel [https://www.podcastawesome.com/2092855/12=
496931-nerd-show-and-tell-meet-sr-developer-ed-emanuel] - Listen in as Ed s=
hares his love for 3D printers, D&D, and how to choose one of 23 variations=
 to magically enhance your icons with the Icon Wizard.
  =20
 * Making Our Kickstarter Video [https://www.podcastawesome.com/2092855/124=
96081-how-font-awesome-broke-kickstarter-records-with-a-hilarious-video] - =
Hear how a hilarious video helped us break Kickstarter records during Font =
Awesome's 2017 Kickstarter campaign.
  =20
 * Font Awesome and Shoelace Joined Forces! [https://www.podcastawesome.com=
/2092855/12714769-the-snuggle-is-real-how-font-awesome-and-shoelace-are-on-=
a-mission-to-make-dev-work-easier] - Learn about how Font Awesome and Shoel=
ace Are on a Mission to Make Dev Work Easier.
  =20

Subscribe to Podcast Awesome [https://podcastawesome.com]

----------------------------------------

But that's not all! While the podcast is currently what's in season, we've =
still made time to tend to our first love - the Font Awesome blog. Here's w=
hat you may have missed:

 * Extreme Icon (Cuteness) Makeover [https://blog.fontawesome.com/extreme-i=
con-cuteness-makeover/] - Follow along as we share how we spent some extra =
time upping the cuteness quotient on our animal icons.
  =20
 * Introducing our new Sharp Light style! [https://blog.fontawesome.com/int=
roducing-sharp-light/] - Looking to slip into a subtle, unobtrusive, and Mo=
dern icon style? Sharp Light is the lust-have icon style of the season.
  =20
 * You Can Now Download a Kit! [https://blog.fontawesome.com/downloadable-k=
its-are-here/] - Bundle up only the icons, tools, and settings you need all=
 custom-like. Now available in a downloadable Kit!

Thanks for reading!
Jory and the Font Awesomes

https://fontawesome.com

Font Awesome
307 S. Main St. | Suite 202
Bentonville, AR 72712, USA

=C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=
=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =
=C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0 =C2=A0
--ecd313dfa965850cdebcd66b5ebb93067df18822eb34d9872053ae07c994
Content-Transfer-Encoding: quoted-printable
Content-Type: text/html; charset=utf-8
Mime-Version: 1.0


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.=
w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns=3D"http://www.w3.org/1999/xhtml" lang=3D"en" xml:lang=3D"en">
  <head>
   =20
    <meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3Dutf-8=
">
    <meta name=3D"viewport" content=3D"width=3Ddevice-width">
    <meta name=3D"color-scheme" content=3D"light dark">
    <meta name=3D"supported-color-schemes" content=3D"light dark">
    <title>Awesome News - May Edition</title>
    <style>@media only screen{html{min-height:100%;background:#f0f1f3}}@med=
ia only screen and (max-width:622px){table.body img{width:auto;height:auto}=
table.body center{min-width:0!important}table.body .container{width:100%!im=
portant}table.body .columns{height:auto!important;-moz-box-sizing:border-bo=
x;-webkit-box-sizing:border-box;box-sizing:border-box;padding-left:42px!imp=
ortant;padding-right:42px!important}table.body .collapse>tbody>tr>.columns{=
padding-left:0!important;padding-right:0!important}th.small-12{display:inli=
ne-block!important;width:100%!important}table.menu{width:100%!important}tab=
le.menu td,table.menu th{width:auto!important;display:inline-block!importan=
t}table.menu.vertical td,table.menu.vertical th{display:block!important}}@m=
edia only screen and (max-width:622px){.card-header{border-top-left-radius:=
0!important;border-top-right-radius:0!important}}@media only screen and (ma=
x-width:622px){.card-body{border-bottom-left-radius:0!important;border-bott=
om-right-radius:0!important}}@media only screen and (max-width:622px){.main=
 .container{border-radius:0!important}table.button table td a{padding:16px =
24px!important}}@media (prefers-color-scheme:dark){.footer,.footer td,.foot=
er-reasons,body,table.body{background-color:#001c40!important}.main .contai=
ner{background-color:#293f60!important}table.h-line th{border-color:#183153=
!important}.footer,a,body,h1,h2,h3,h4,h5,h6,p,span,strong,table.body,td,th{=
color:#f0f1f3!important}.card-header.blue,.card-header.purple,.card-header.=
red,.card-header.teal{color:#183153!important}.card-header.blue .title,.car=
d-header.purple .title,.card-header.red .title,.card-header.teal .title{col=
or:#183153!important}.button.alert a,.button.success a{color:#183153!import=
ant}.button.default a{color:#183153!important}.footer a,.footer p,.footer t=
d,.footer-reasons p{color:#8991a5!important}}</style>
  </head>
  <body style=3D"-moz-box-sizing:border-box;-ms-text-size-adjust:100%;-webk=
it-box-sizing:border-box;-webkit-text-size-adjust:100%;Margin:0;box-sizing:=
border-box;color:#183153;font-family:'Cera Round Pro',' Proxima Nova Soft',=
' Proxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px=
;font-weight:400;line-height:1.5;margin:0;min-width:100%;padding:0;text-ali=
gn:left;width:100%!important">
    <span class=3D"preheader" style=3D"color:#f0f1f3;display:none!important=
;font-size:1px;line-height:1px;max-height:0;max-width:0;mso-hide:all!import=
ant;opacity:0;overflow:hidden;visibility:hidden"></span>
    <table class=3D"body ea" role=3D"presentation" style=3D"Margin:0;backgr=
ound:#f0f1f3;border-collapse:collapse;border-spacing:0;color:#183153;font-f=
amily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neu=
e',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;height:100%;li=
ne-height:1.5;margin:0;padding:0;text-align:left;vertical-align:top;width:1=
00%">
      <tr style=3D"padding:0;text-align:left;vertical-align:top">
        <td class=3D"center" align=3D"center" valign=3D"top" style=3D"-moz-=
box-sizing:border-box;-moz-hyphens:auto;-webkit-box-sizing:border-box;-webk=
it-hyphens:auto;Margin:0;border-collapse:collapse!important;box-sizing:bord=
er-box;color:#183153;font-family:'Cera Round Pro',' Proxima Nova Soft',' Pr=
oxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;fon=
t-weight:400;hyphens:auto;line-height:1.5;margin:0;padding:0;text-align:lef=
t;vertical-align:top;word-wrap:break-word">
          <center style=3D"width:100%">
            <table align=3D"center" class=3D"spacer float-center" role=3D"p=
resentation" style=3D"Margin:0 auto;border-collapse:collapse;border-spacing=
:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;=
width:100%"><tbody><tr style=3D"padding:0;text-align:left;vertical-align:to=
p"><td height=3D"24" style=3D"-moz-box-sizing:border-box;-moz-hyphens:auto;=
-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-collapse=
:collapse!important;box-sizing:border-box;color:#183153;font-family:'Cera R=
ound Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,=
Arial,sans-serif;font-size:24px;font-weight:400;hyphens:auto;line-height:24=
px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:left;vertical=
-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></table>=20
            <table align=3D"center" class=3D"wrapper header float-center" r=
ole=3D"presentation" style=3D"Margin:0 auto;border-collapse:collapse;border=
-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-al=
ign:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;vertical-=
align:top"><td class=3D"wrapper-inner" style=3D"-moz-box-sizing:border-box;=
-moz-hyphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin=
:0;border-collapse:collapse!important;box-sizing:border-box;color:#183153;f=
ont-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetic=
a Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:a=
uto;line-height:1.5;margin:0;padding:0;text-align:left;vertical-align:top;w=
ord-wrap:break-word">
              <table align=3D"center" class=3D"container main" role=3D"pres=
entation" style=3D"Margin:0 auto;background:0 0;border-collapse:collapse;bo=
rder-spacing:0;margin:0 auto;padding:0;text-align:inherit;vertical-align:to=
p;width:580px"><tbody><tr style=3D"padding:0;text-align:left;vertical-align=
:top"><td style=3D"-moz-box-sizing:border-box;-moz-hyphens:auto;-webkit-box=
-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!i=
mportant;box-sizing:border-box;color:#183153;font-family:'Cera Round Pro','=
 Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,Arial,sans-=
serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.5;margin:0;=
padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                <table class=3D"row collapse" role=3D"presentation" style=
=3D"border-collapse:collapse;border-spacing:0;display:table;padding:0;posit=
ion:relative;text-align:left;vertical-align:top;width:100%"><tbody><tr styl=
e=3D"padding:0;text-align:left;vertical-align:top">
                  <th class=3D"small-12 large-12 columns first last" style=
=3D"-moz-box-sizing:border-box;-moz-hyphens:auto;-webkit-box-sizing:border-=
box;-webkit-hyphens:auto;Margin:0 auto;border-collapse:collapse!important;b=
ox-sizing:border-box;color:#183153;font-family:'Cera Round Pro',' Proxima N=
ova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;font=
-size:16px;font-weight:400;hyphens:auto;line-height:1.5;margin:0 auto;paddi=
ng:0;padding-bottom:16px;padding-left:0;padding-right:0;text-align:left;ver=
tical-align:top;width:601px;word-wrap:break-word"><table role=3D"presentati=
on" style=3D"border-collapse:collapse;border-spacing:0;padding:0;text-align=
:left;vertical-align:top;width:100%"><tbody><tr style=3D"padding:0;text-ali=
gn:left;vertical-align:top"><th style=3D"-moz-box-sizing:border-box;-moz-hy=
phens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bord=
er-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fam=
ily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue'=
,Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;lin=
e-height:1.5;margin:0;padding:0;text-align:left;vertical-align:top;word-wra=
p:break-word">
                    <h1 class=3D"text-center" style=3D"Margin:0;Margin-bott=
om:10px;color:inherit;font-family:'Cera Round Pro',' Proxima Nova Soft',' P=
roxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;font-size:24px;fo=
nt-weight:600;letter-spacing:5px;line-height:1.5;margin:0;margin-bottom:0;p=
adding:0;text-align:center;word-wrap:normal">
                      <img class=3D"logo" width=3D"360" height=3D"66" src=
=3D"https://img.fortawesome.com/07dde85b/font-awesome-email-simple-logo.png=
" alt=3D"Font Awesome" style=3D"-ms-interpolation-mode:bicubic;clear:none;d=
isplay:inline-block;height:66px;max-width:100%;outline:0;text-decoration:no=
ne;vertical-align:middle;width:360px">
                    </h1>
                  </th>
<th class=3D"expander" style=3D"-moz-box-sizing:border-box;-moz-hyphens:aut=
o;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-collap=
se:collapse!important;box-sizing:border-box;color:#183153;font-family:'Cera=
 Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetic=
a,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:=
1.5;margin:0;padding:0!important;text-align:left;vertical-align:top;visibil=
ity:hidden;width:0;word-wrap:break-word"></th></tr></tbody></table></th>
                </tr></tbody></table>
              </td></tr></tbody></table>
            </td></tr></tbody></table>
            <table align=3D"center" class=3D"wrapper main float-center" rol=
e=3D"presentation" style=3D"Margin:0 auto;border-collapse:collapse;border-s=
pacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-alig=
n:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;vertical-al=
ign:top"><td class=3D"wrapper-inner" style=3D"-moz-box-sizing:border-box;-m=
oz-hyphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0=
;border-collapse:collapse!important;box-sizing:border-box;color:#183153;fon=
t-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica =
Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:aut=
o;line-height:1.5;margin:0;padding:0;text-align:left;vertical-align:top;wor=
d-wrap:break-word">
              <table align=3D"center" class=3D"container card" role=3D"pres=
entation" style=3D"Margin:0 auto;background:#fff;border-collapse:collapse;b=
order-radius:16px;border-spacing:0;margin:0 auto;padding:0;text-align:inher=
it;vertical-align:top;width:580px"><tbody><tr style=3D"padding:0;text-align=
:left;vertical-align:top"><td style=3D"-moz-box-sizing:border-box;-moz-hyph=
ens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;border=
-collapse:collapse!important;box-sizing:border-box;color:#183153;font-famil=
y:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',H=
elvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-=
height:1.5;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:=
break-word">
                <table class=3D"row" role=3D"presentation" style=3D"border-=
collapse:collapse;border-spacing:0;display:table;padding:0;position:relativ=
e;text-align:left;vertical-align:top;width:100%"><tbody><tr style=3D"paddin=
g:0;text-align:left;vertical-align:top">
                  <th class=3D"small-12 large-12 columns first last" style=
=3D"-moz-box-sizing:border-box;-moz-hyphens:auto;-webkit-box-sizing:border-=
box;-webkit-hyphens:auto;Margin:0 auto;border-collapse:collapse!important;b=
ox-sizing:border-box;color:#183153;font-family:'Cera Round Pro',' Proxima N=
ova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;font=
-size:16px;font-weight:400;hyphens:auto;line-height:1.5;margin:0 auto;paddi=
ng:0;padding-bottom:32px;padding-left:42px;padding-right:42px;text-align:le=
ft;vertical-align:top;width:538px;word-wrap:break-word"><table role=3D"pres=
entation" style=3D"border-collapse:collapse;border-spacing:0;padding:0;text=
-align:left;vertical-align:top;width:100%"><tbody><tr style=3D"padding:0;te=
xt-align:left;vertical-align:top"><th style=3D"-moz-box-sizing:border-box;-=
moz-hyphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:=
0;border-collapse:collapse!important;box-sizing:border-box;color:#183153;fo=
nt-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica=
 Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:au=
to;line-height:1.5;margin:0;padding:0;text-align:left;vertical-align:top;wo=
rd-wrap:break-word">
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"42" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:42px;font-weight:400;hyphens:auto;li=
ne-height:42px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                    <!-- CONTENT START -->
                    <img width=3D"500" height=3D"130" src=3D"https://img.fo=
rtawesome.com/07dde85b/email-newsletter-header.png" alt style=3D"-ms-interp=
olation-mode:bicubic;clear:both;display:block;max-width:100%;outline:0;text=
-decoration:none;width:auto">
                   =20
                    <p style=3D"Margin:0;Margin-bottom:10px;color:#183153;f=
ont-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetic=
a Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-heig=
ht:1.5;margin:0;margin-bottom:10px;padding:0;text-align:left">Hey there, fo=
lks. Spring has sprung. But did February like March? No, but April May.</p>
                   =20
                    <p style=3D"Margin:0;Margin-bottom:10px;color:#183153;f=
ont-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetic=
a Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-heig=
ht:1.5;margin:0;margin-bottom:10px;padding:0;text-align:left">And while we'=
re on the subject of gardening, we did start planting the seeds of a new po=
dcast, so we hope it=E2=80=99s growing on you!</p>
                   =20
                    <em>[Editor's Note: Apologies for leaning into the dad =
jokes so early in this email.]</em>
                   =20
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"32" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:32px;font-weight:400;hyphens:auto;li=
ne-height:32px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                    <table class=3D"h-line" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tr style=3D"padding:0;text-align:left;vertical-ali=
gn:top"><th style=3D"-moz-box-sizing:border-box;-moz-hyphens:auto;-webkit-b=
ox-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-bottom:3px solid =
#f0f1f3;border-collapse:collapse!important;border-left:0;border-right:0;bor=
der-top:0;box-sizing:border-box;clear:both;color:#183153;font-family:'Cera =
Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica=
,Arial,sans-serif;font-size:0;font-weight:400;height:0;hyphens:auto;line-he=
ight:0;margin:0;padding:0;padding-bottom:0;padding-top:0;text-align:center;=
vertical-align:top;width:580px;word-wrap:break-word">&nbsp;</th></tr></tabl=
e>
                   =20
                    <img width=3D"500" height=3D"130" src=3D"https://img.fo=
rtawesome.com/07dde85b/email-newsletter-podcast-header.png" alt style=3D"-m=
s-interpolation-mode:bicubic;clear:both;display:block;max-width:100%;outlin=
e:0;text-decoration:none;width:auto">
                   =20
                    <h4 style=3D"Margin:0;Margin-bottom:10px;color:inherit;=
font-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helveti=
ca Neue',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;line-hei=
ght:1.5;margin:0;margin-bottom:10px;padding:0;text-align:left;word-wrap:nor=
mal">Nerd it up with us at Podcast Awesome</h4>=20
                   =20
                    <p style=3D"Margin:0;Margin-bottom:10px;color:#183153;f=
ont-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetic=
a Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-heig=
ht:1.5;margin:0;margin-bottom:10px;padding:0;text-align:left">We're not ash=
amed to admit it. We're nerds =E2=80=94 but you know, <em>the kind of nerds=
 who like people</em>. On season 1 of the podcast, we couldn't wait to intr=
oduce you to the Font Awesome team. And what better way to get acquainted t=
han our <strong>Nerd Show and Tell?</strong></p>
                   =20
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"8" style=3D"-moz-box-sizing:border-box;-moz-hy=
phens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bord=
er-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fam=
ily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue'=
,Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;hyphens:auto;line=
-height:8px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:left=
;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></table>=
=20
                   =20
                    <ul>
                    <li><a href=3D"https://www.podcastawesome.com/2092855/1=
2487143-nerd-show-and-tell-meet-alex-poiry" style=3D"color:#1c7ed6;font-fam=
ily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue'=
,Helvetica,Arial,sans-serif;font-weight:400;line-height:1.5;padding:0;text-=
align:left;text-decoration:underline"><strong>Meet Head of Security Alex Po=
iry</strong></a> - Ask Alex to stop making such corny security jokes around=
 the office, and he'll tell you he can't hack it. And how is VR and traditi=
onal European martial arts connected? You'll need to listen to find out.</l=
i>
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                   =20
                    <li><a href=3D"https://www.podcastawesome.com/2092855/1=
2496931-nerd-show-and-tell-meet-sr-developer-ed-emanuel" style=3D"color:#1c=
7ed6;font-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' He=
lvetica Neue',Helvetica,Arial,sans-serif;font-weight:400;line-height:1.5;pa=
dding:0;text-align:left;text-decoration:underline"><strong>Meet Sr. Develop=
er Ed Emanuel</strong></a> - Listen in as Ed shares his love for 3D printer=
s, D&D, and how to choose one of 23 variations to magically enhance your ic=
ons with the Icon Wizard.</li>
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                   =20
                    <li><a href=3D"https://www.podcastawesome.com/2092855/1=
2496081-how-font-awesome-broke-kickstarter-records-with-a-hilarious-video" =
style=3D"color:#1c7ed6;font-family:'Cera Round Pro',' Proxima Nova Soft',' =
Proxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:400;=
line-height:1.5;padding:0;text-align:left;text-decoration:underline"><stron=
g>Making Our Kickstarter Video</strong></a> - Hear how a hilarious video he=
lped us break Kickstarter records during Font Awesome's 2017 Kickstarter ca=
mpaign.</li>
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                   =20
                    <li><a href=3D"https://www.podcastawesome.com/2092855/1=
2714769-the-snuggle-is-real-how-font-awesome-and-shoelace-are-on-a-mission-=
to-make-dev-work-easier" style=3D"color:#1c7ed6;font-family:'Cera Round Pro=
',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,Arial,sa=
ns-serif;font-weight:400;line-height:1.5;padding:0;text-align:left;text-dec=
oration:underline"><strong>Font Awesome and Shoelace Joined Forces!</strong=
></a> - Learn about how Font Awesome and Shoelace Are on a Mission to Make =
Dev Work Easier.</li>
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                   =20
                    </ul>
                   =20
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                   =20
                    <center style=3D"width:100%"><!--[if mso]><div><v:round=
rect xmlns:v=3D"urn:schemas-microsoft-com:vml"
    xmlns:w=3D"urn:schemas-microsoft-com:office:word"
    href=3D"https://podcastawesome.com"
    style=3D"height: 64px; v-text-anchor: middle; width: 250px"
    arcsize=3D"20%"
    strokecolor=3D"#1e3650"
    fillcolor=3D"#63E6BE"><w:anchorlock /><center
      style=3D"
        color: #DBE5F0;
        font-family: sans-serif;
        font-size: 16px;
        font-weight: bold;
        mso-style-textfill-type:gradient;
        mso-style-textfill-fill-gradientfill-stoplist:'0 #183153 1 100000,9=
9000 #183153 1 100000';
      "
    >
      Subscribe to Podcast Awesome
    </center></v:roundrect></div><![endif]-->
    <!--[if !mso]><!-- -->
    <table class=3D"button success radius float-center" role=3D"presentatio=
n" style=3D"Margin:0 0 32px 0;border-collapse:collapse;border-spacing:0;flo=
at:none;margin:0 0 32px 0;padding:0;text-align:center;vertical-align:top;wi=
dth:auto">
                <tbody>
                    <tr style=3D"padding:0;text-align:left;vertical-align:t=
op">
                        <td style=3D"-moz-box-sizing:border-box;-moz-hyphen=
s:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-c=
ollapse:collapse!important;box-sizing:border-box;color:#183153;font-family:=
'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Hel=
vetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-he=
ight:1.5;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:br=
eak-word">
                            <table role=3D"presentation" style=3D"border-co=
llapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:t=
op;width:auto">
                                <tbody>
                                    <tr style=3D"padding:0;text-align:left;=
vertical-align:top">
                                        <td style=3D"-moz-box-sizing:border=
-box;-moz-hyphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;M=
argin:0;background:#63e6be;border:0 solid #63e6be;border-collapse:collapse!=
important;border-radius:8px;box-sizing:border-box;color:#183153;font-family=
:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',He=
lvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-h=
eight:1.5;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:b=
reak-word"><a align=3D"center" href=3D"https://podcastawesome.com" style=3D=
"border:2px solid #183153!important;border-bottom-width:6px!important;borde=
r-radius:8px;color:#001c40!important;display:inline-block;font-family:'Cera=
 Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetic=
a,Arial,sans-serif;font-size:16px;font-weight:700;line-height:1.5;padding:1=
6px 40px 16px 40px;text-align:center;text-decoration:none">Subscribe to Pod=
cast Awesome</a></td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                       =20
                    </tr>
                </tbody>
            </table>
            <!--<![endif]--></center>
                   =20
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                    <table class=3D"h-line" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tr style=3D"padding:0;text-align:left;vertical-ali=
gn:top"><th style=3D"-moz-box-sizing:border-box;-moz-hyphens:auto;-webkit-b=
ox-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-bottom:3px solid =
#f0f1f3;border-collapse:collapse!important;border-left:0;border-right:0;bor=
der-top:0;box-sizing:border-box;clear:both;color:#183153;font-family:'Cera =
Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica=
,Arial,sans-serif;font-size:0;font-weight:400;height:0;hyphens:auto;line-he=
ight:0;margin:0;padding:0;padding-bottom:0;padding-top:0;text-align:center;=
vertical-align:top;width:580px;word-wrap:break-word">&nbsp;</th></tr></tabl=
e>
                   =20
                    <img width=3D"500" height=3D"130" src=3D"https://img.fo=
rtawesome.com/07dde85b/email-newsletter-blog-header.png" alt style=3D"-ms-i=
nterpolation-mode:bicubic;clear:both;display:block;max-width:100%;outline:0=
;text-decoration:none;width:auto">
                   =20
                    <p style=3D"Margin:0;Margin-bottom:10px;color:#183153;f=
ont-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetic=
a Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-heig=
ht:1.5;margin:0;margin-bottom:10px;padding:0;text-align:left">But that's no=
t all! While the podcast is currently what's in season, we've still made ti=
me to tend to our first love - the Font Awesome blog. Here's what you may h=
ave missed:</p>
                   =20
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"8" style=3D"-moz-box-sizing:border-box;-moz-hy=
phens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bord=
er-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fam=
ily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue'=
,Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;hyphens:auto;line=
-height:8px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:left=
;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></table>=
=20
                   =20
                    <ul>
                   =20
                    <li><a href=3D"https://blog.fontawesome.com/extreme-ico=
n-cuteness-makeover/" style=3D"color:#1c7ed6;font-family:'Cera Round Pro','=
 Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,Arial,sans-=
serif;font-weight:400;line-height:1.5;padding:0;text-align:left;text-decora=
tion:underline"><strong>Extreme Icon (Cuteness) Makeover</strong></a> - Fol=
low along as we share how we spent some extra time upping the cuteness quot=
ient on our animal icons.</li>
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                   =20
                    <li><a href=3D"https://blog.fontawesome.com/introducing=
-sharp-light/" style=3D"color:#1c7ed6;font-family:'Cera Round Pro',' Proxim=
a Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;f=
ont-weight:400;line-height:1.5;padding:0;text-align:left;text-decoration:un=
derline"><strong>Introducing our new Sharp Light style!</strong></a> - Look=
ing to slip into a subtle, unobtrusive, and Modern icon style? Sharp Light =
is the <em>lust-have</em> icon style of the season.</li>
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                   =20
                    <li><a href=3D"https://blog.fontawesome.com/downloadabl=
e-kits-are-here/" style=3D"color:#1c7ed6;font-family:'Cera Round Pro',' Pro=
xima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,Arial,sans-seri=
f;font-weight:400;line-height:1.5;padding:0;text-align:left;text-decoration=
:underline"><strong>You Can Now Download a Kit!</strong></a> - Bundle up on=
ly the icons, tools, and settings you need all custom-like. Now available i=
n a downloadable Kit!</li>
                   =20
                    </ul>
                   =20
                    <table class=3D"spacer" role=3D"presentation" style=3D"=
border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertica=
l-align:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;verti=
cal-align:top"><td height=3D"16" style=3D"-moz-box-sizing:border-box;-moz-h=
yphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;bor=
der-collapse:collapse!important;box-sizing:border-box;color:#183153;font-fa=
mily:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue=
',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;li=
ne-height:16px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:l=
eft;vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></tabl=
e>=20
                   =20
                    <p style=3D"Margin:0;Margin-bottom:10px;color:#183153;f=
ont-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetic=
a Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-heig=
ht:1.5;margin:0;margin-bottom:10px;padding:0;text-align:left">Thanks for re=
ading!<br>
                    Jory and the Font Awesomes</p>=20
                   =20
                   =20
                    <!-- CONTENT END -->
                  </th>
<th class=3D"expander" style=3D"-moz-box-sizing:border-box;-moz-hyphens:aut=
o;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-collap=
se:collapse!important;box-sizing:border-box;color:#183153;font-family:'Cera=
 Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetic=
a,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:=
1.5;margin:0;padding:0!important;text-align:left;vertical-align:top;visibil=
ity:hidden;width:0;word-wrap:break-word"></th></tr></tbody></table></th>
                </tr></tbody></table>
              </td></tr></tbody></table>
            </td></tr></tbody></table>
            <table align=3D"center" class=3D"spacer float-center" role=3D"p=
resentation" style=3D"Margin:0 auto;border-collapse:collapse;border-spacing=
:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;=
width:100%"><tbody><tr style=3D"padding:0;text-align:left;vertical-align:to=
p"><td height=3D"32" style=3D"-moz-box-sizing:border-box;-moz-hyphens:auto;=
-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-collapse=
:collapse!important;box-sizing:border-box;color:#183153;font-family:'Cera R=
ound Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',Helvetica,=
Arial,sans-serif;font-size:32px;font-weight:400;hyphens:auto;line-height:32=
px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:left;vertical=
-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></table>=20
            <table align=3D"center" class=3D"wrapper footer2 float-center" =
role=3D"presentation" style=3D"Margin:0 auto;border-collapse:collapse;borde=
r-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-a=
lign:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;vertical=
-align:top"><td class=3D"wrapper-inner" style=3D"-moz-box-sizing:border-box=
;-moz-hyphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margi=
n:0;border-collapse:collapse!important;box-sizing:border-box;color:#183153;=
font-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helveti=
ca Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:=
auto;line-height:1.5;margin:0;padding:0;text-align:left;vertical-align:top;=
word-wrap:break-word">
              <table align=3D"center" class=3D"container footer" role=3D"pr=
esentation" style=3D"Margin:0 auto;background:0 0;background-color:#f0f1f3;=
border-collapse:collapse;border-spacing:0;margin:0 auto;padding:0;text-alig=
n:inherit;vertical-align:top;width:580px"><tbody><tr style=3D"padding:0;tex=
t-align:left;vertical-align:top"><td style=3D"-moz-box-sizing:border-box;-m=
oz-hyphens:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0=
;border-collapse:collapse!important;box-sizing:border-box;color:#183153;fon=
t-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica =
Neue',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:aut=
o;line-height:1.5;margin:0;padding:0;text-align:left;vertical-align:top;wor=
d-wrap:break-word">
                <table class=3D"row collapse" role=3D"presentation" style=
=3D"border-collapse:collapse;border-spacing:0;display:table;padding:0;posit=
ion:relative;text-align:left;vertical-align:top;width:100%"><tbody><tr styl=
e=3D"padding:0;text-align:left;vertical-align:top">
                    <p style=3D"Margin:0;Margin-bottom:10px;color:#8991a5;f=
ont-family:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetic=
a Neue',Helvetica,Arial,sans-serif;font-size:.9rem;font-weight:400;line-hei=
ght:1.5;margin:0;margin-bottom:10px;padding:0;text-align:center">
                      <a href=3D"https://fontawesome.com" style=3D"Margin:d=
efault;color:#1c7ed6;font-family:'Cera Round Pro',' Proxima Nova Soft',' Pr=
oxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:400;li=
ne-height:1.5;margin:default;padding:0;text-align:left;text-decoration:unde=
rline">
                        <img class=3D"logo" style=3D"-ms-interpolation-mode=
:bicubic;border:none;clear:both;display:block;height:32px;margin:0 auto;max=
-width:100%;outline:0;text-decoration:none;width:32px" src=3D"https://img.f=
ortawesome.com/07dde85b/font-awesome-email-badge.png" width=3D"32" height=
=3D"32" alt=3D"Font Awesome">
                      </a>
                    </p>
                    <p class=3D"text-center" style=3D"Margin:0;Margin-botto=
m:10px;color:#8991a5;font-family:'Cera Round Pro',' Proxima Nova Soft',' Pr=
oxima Nova',' Helvetica Neue',Helvetica,Arial,sans-serif;font-size:.9rem;fo=
nt-weight:400;line-height:1.5;margin:0;margin-bottom:10px;padding:0;text-al=
ign:center">Font Awesome<br>
                    307 S. Main St. | Suite 202<br>
                    Bentonville, AR 72712, USA</p>
                  </tr></tbody></table></td></tr></tbody></table></td></tr>=
</tbody></table></center>
               =20
                <table class=3D"spacer" role=3D"presentation" style=3D"bord=
er-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-al=
ign:top;width:100%"><tbody><tr style=3D"padding:0;text-align:left;vertical-=
align:top"><td height=3D"42" style=3D"-moz-box-sizing:border-box;-moz-hyphe=
ns:auto;-webkit-box-sizing:border-box;-webkit-hyphens:auto;Margin:0;border-=
collapse:collapse!important;box-sizing:border-box;color:#183153;font-family=
:'Cera Round Pro',' Proxima Nova Soft',' Proxima Nova',' Helvetica Neue',He=
lvetica,Arial,sans-serif;font-size:42px;font-weight:400;hyphens:auto;line-h=
eight:42px;margin:0;mso-line-height-rule:exactly;padding:0;text-align:left;=
vertical-align:top;word-wrap:break-word">&nbsp;</td></tr></tbody></table>=
=20
             =20
           =20
         =20
        </td>
      </tr>
    </table>
    <!-- prevent Gmail on iOS font size manipulation -->
   <div style=3D"display:none;white-space:nowrap;font:15px courier;line-hei=
ght:0"> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbs=
p; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &n=
bsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
  <table border=3D"0" cellpadding=3D"0" cellspacing=3D"0" class=3D"footer" =
style=3D"width:100%">
=09<tbody>
=09=09<tr>
=09=09=09<td align=3D"center" height=3D"100%" style=3D"background-color:#f0=
f1f3; color:#8991a5; font-size:14px; padding:25px 15px 50px 15px; vertical-=
align:top" width=3D"100%">You&rsquo;re subscribed to the Font Awesome maili=
ng list. <a href=3D"http://link.m.fontawesome.com/wf/unsubscribe?upn=3DTgaB=
L0U-2BVojh6stGbNMGVxhNKydRP6Xknl-2B8-2Fvmv0aKciQjjKtQp1H6JmRA2xy9zpd8vMuPEC=
QO0Dze09DDumIqhsWiU4nFMwUc8NINMBjaineiesQA2NwE2T7iRVa4yFsHM9mFXdxD3ep-2FGrP=
yMioLkhYEhN-2BlNbYnLt45VI3U3Vo-2FBFG0XyQcl2shsn8nj-2Bi1-2BmYbYStTO-2BmweY9b=
Dwf5yhE7ACk-2Furi0aNdND8kAqSsglnCjaRZefaVyCUap3"> Unsubscribe </a></td>
=09=09</tr>
=09</tbody>
</table>
</body>
</html>


--ecd313dfa965850cdebcd66b5ebb93067df18822eb34d9872053ae07c994--`;

const output = MailDecoder.decodeQuotedPrintable(input);

console.log(output);