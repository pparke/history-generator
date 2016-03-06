StefanBoltz=5.6704E-8;
kb=1.3806503E-23;
qc=1.60217646E-19;
function sqr(c){
  return Math.pow(c,2)
}

function log10(c){
  return Math.log(c)/Math.LN10
}

function ToRad(c){
  return c*Math.PI/180
}

function ToDeg(c){
  return 180*c/Math.PI
}

function trunc(c){return 0<c?Math.floor(c):Math.ceil(c)}
function cosh(c){
  var e=Math.pow(Math.E,c);
  c=Math.pow(Math.E,-c);
  return(e+c)/2}

function sinh(c){
  var e=Math.pow(Math.E,c);
  c=Math.pow(Math.E,-c);
  return(e-c)/2
}

function erf(c){
  var e=1;0>c&&(e=-1);
  c=Math.abs(c);
  var f=1/(1+0.3275911*c);
  c=1-((((1.061405429*f+-1.453152027)*f+1.421413741)*f+-0.284496736)*f+0.254829592)*f*Math.exp(-c*c);
  return e*c
}

function erfc(c){
  return 1-erf(c)
}

function PhotonEnergy(c){
  x=c-0;
  return FourDec(1.2398/x)
}

function PhotonWavelength(c){
  x=c.wavelength.value-0;
  c.energy_eV.value=(1.2398/x).toFixed(4);
  c.energy_J.value=(c.energy_eV.value*qc).toExponential(2)
}

function PhotonEnergy_eV(c){
  x=c.energy_eV.value-0;c.wavelength.value=(1.2398/x).toFixed(4);c.energy_J.value=(c.energy_eV.value*qc).toExponential(2)
}

function PhotonEnergy_J(c){x=c.energy_J.value-0;c.energy_eV.value=(x/qc).toFixed(4);c.wavelength.value=(1.2398/(x/qc)).toFixed(4)
}
function PFlux(c){flux=c.flux.value-0;Ep=c.Ep.value-0;return(qc*flux*Ep).toFixed(4)
}
function Blackbody(c){
  t=c.Temp.value-0;
  c.wavelength.value=(0.0029/t*Math.pow(10,6)).toFixed(4);
  c.RI.value=(StefanBoltz*Math.pow(t,4)).toFixed(4)
}
function Radiation(c){
  return(1353*(1+0.033*Math.cos(ToRad(360/365*(c-2))))).toFixed(1)
}
function H0(c){
  x=c-0;x*=1E9;
  return(2.8942E25/(x*x)).toFixed(2)
}
function HoursMinutes(c){
  h=Math.floor(c);
  m=Math.floor(60*(c-h));
  return h.toFixed(0)+":"+m.toFixed(0)
}
function AirMass(c){
  x=c-0;
  x=x*Math.PI/180;
  return(1/Math.cos(x)).toFixed(4)
}
function SandH(c){
  h=c.H.value-0;
  s=c.S.value-0;
  return Math.sqrt(1+Math.pow(s/h,2)).toFixed(4)
}
function Intensity(c){
  AM=c.expr.value-0;
  c.It.value=(1.353*Math.pow(0.7,Math.pow(AM,0.678))).toFixed(4);
  c.Ig.value=(1.1*c.It.value).toFixed(4)
}
function CheckHemisphere(c){
  return!0==c?-1:1
}
function Alpha(c,e){
  return 90-c-e
}
function Declination(c){
  return 23.45*Math.sin(ToRad(360/365*(c-81)))
}

function AM(c,e,f){
  dec=ToRad(Declination(e));
  HRA=ToRad(15*(c-12));
  elevation=Math.asin(Math.sin(dec)*Math.sin(f)+Math.cos(dec)*Math.cos(f)*Math.cos(HRA));
  declination=ToRad(90)-elevation;
  return 1/(1E-4+Math.cos(declination))
}
function dayToDate(c){cumuDay=0;if(31>=c-cumuDay)return"Jan "+(c-cumuDay);cumuDay+=31;if(28>=c-cumuDay)return"Feb "+(c-cumuDay);cumuDay+=28;if(31>=c-cumuDay)return"Mar "+(c-cumuDay);cumuDay+=31;if(30>=c-cumuDay)return"Apr "+(c-cumuDay);cumuDay+=30;if(31>=c-cumuDay)return"May "+(c-cumuDay);cumuDay+=31;if(30>=c-cumuDay)return"Jun "+(c-cumuDay);cumuDay+=30;if(31>=c-cumuDay)return"Jul "+(c-cumuDay);cumuDay+=31;if(31>=c-cumuDay)return"Aug "+(c-cumuDay);cumuDay+=31;if(30>=c-cumuDay)return"Sep "+(c-cumuDay);
cumuDay+=30;if(31>=c-cumuDay)return"Oct "+(c-cumuDay);cumuDay+=31;if(30>=c-cumuDay)return"Nov "+(c-cumuDay);cumuDay+=30;if(31>=c-cumuDay)return"Dec "+(c-cumuDay);cumuDay+=31;return"!!"}
function IntensityM(c){d=c.d.value-0;b=ToRad(c.b.value-0);lat=c.lat.value-0;S=c.S.value-0;hemisphere=CheckHemisphere(c.hemisphere[0].checked);dec=Declination(d)*hemisphere;a=Alpha(lat,dec);c.a.value=TwoDec(a);a=ToRad(a);Sb=S*Math.sin(a+b)/Math.sin(a);Si=S/Math.sin(a);c.dec.value=TwoDec(dec*hemisphere);c.Sb.value=TwoDec(Sb);c.Si.value=TwoDec(Si)}
function IntensityH(c){d=c.d.value-0;b=ToRad(c.b.value-0);lat=c.lat.value-0;SI=c.SI.value-0;hemisphere=CheckHemisphere(c.hemisphere[0].checked);dec=Declination(d)*hemisphere;a=Alpha(lat,dec);c.a.value=TwoDec(a);a=ToRad(a);Sm=SI*Math.sin(a+b);Sh=SI*Math.sin(a);c.dec.value=TwoDec(dec*hemisphere);c.Sm.value=TwoDec(Sm);c.Sh.value=TwoDec(Sh)}
function IntensityI(c){d=c.d.value-0;b=ToRad(c.b.value-0);lat=c.lat.value-0;SM=c.SM.value-0;hemisphere=CheckHemisphere(c.hemisphere[0].checked);dec=Declination(d)*hemisphere;a=Alpha(lat,dec);c.a.value=TwoDec(a);a=ToRad(a);Sy=SM*Math.sin(a)/Math.sin(a+b);Sz=SM/Math.sin(a+b);c.dec.value=TwoDec(dec*hemisphere);c.Sy.value=TwoDec(Sy);c.Sz.value=TwoDec(Sz)}
function IntensityPSA(c){udtTimeiYear=c.year.value-0;udtTimeiMonth=c.month.value-0;udtTimeiDay=c.day.value-0;udtTimedHours=c.hour.value-0;udtTimedMinutes=c.minute.value-0;udtTimedSeconds=c.second.value-0;udtLocationdLongitude=c.longitude.value-0;udtLocationdLatitude=c.latitude.value-0;pi=3.141592653589793;twopi=2*pi;rad=pi/180;dEarthMeanRadius=6371.01;dAstronomicalUnit=149597890;dDecimalHours=udtTimedHours+(udtTimedMinutes+udtTimedSeconds/60)/60;liAux1=trunc((udtTimeiMonth-14)/12);liAux2=trunc(1461*
(udtTimeiYear+4800+liAux1)/4)+trunc(367*(udtTimeiMonth-2-12*liAux1)/12)-trunc(3*trunc((udtTimeiYear+4900+liAux1)/100)/4)+udtTimeiDay-32075;dJulianDate=liAux2-0.5+dDecimalHours/24;dElapsedJulianDays=dJulianDate-2451545;dOmega=2.1429-0.0010394594*dElapsedJulianDays;dMeanLongitude=4.895063+0.017202791698*dElapsedJulianDays;dMeanAnomaly=6.24006+0.0172019699*dElapsedJulianDays;dEclipticLongitude=dMeanLongitude+0.03341607*Math.sin(dMeanAnomaly)+3.4894E-4*Math.sin(2*dMeanAnomaly)-1.134E-4-2.03E-5*Math.sin(dOmega);
dEclipticObliquity=0.4090928-6.214E-9*dElapsedJulianDays+3.96E-5*Math.cos(dOmega);dSin_EclipticLongitude=Math.sin(dEclipticLongitude);dY=Math.cos(dEclipticObliquity)*dSin_EclipticLongitude;dX=Math.cos(dEclipticLongitude);dRightAscension=Math.atan2(dY,dX);0>dRightAscension&&(dRightAscension+=twopi);dDeclination=Math.asin(Math.sin(dEclipticObliquity)*dSin_EclipticLongitude);dGreenwichMeanSiderealTime=6.6974243242+0.0657098283*dElapsedJulianDays+dDecimalHours;dLocalMeanSiderealTime=(15*dGreenwichMeanSiderealTime+
udtLocationdLongitude)*rad;dHourAngle=dLocalMeanSiderealTime-dRightAscension;dLatitudeInRadians=udtLocationdLatitude*rad;dCos_Latitude=Math.cos(dLatitudeInRadians);dSin_Latitude=Math.sin(dLatitudeInRadians);dCos_HourAngle=Math.cos(dHourAngle);udtSunCoordinatesdZenithAngle=Math.acos(dCos_Latitude*dCos_HourAngle*Math.cos(dDeclination)+Math.sin(dDeclination)*dSin_Latitude);dY=-Math.sin(dHourAngle);dX=Math.tan(dDeclination)*dCos_Latitude-dSin_Latitude*dCos_HourAngle;udtSunCoordinatesdAzimuth=Math.atan2(dY,
dX);0>udtSunCoordinatesdAzimuth&&(udtSunCoordinatesdAzimuth+=twopi);udtSunCoordinatesdAzimuth/=rad;dParallax=dEarthMeanRadius/dAstronomicalUnit*Math.sin(udtSunCoordinatesdZenithAngle);udtSunCoordinatesdZenithAngle=(udtSunCoordinatesdZenithAngle+dParallax)/rad;c.azimuth.value=FourDec(udtSunCoordinatesdAzimuth);c.zenith.value=FourDec(udtSunCoordinatesdZenithAngle);c.elevation.value=FourDec(90-udtSunCoordinatesdZenithAngle)}
function arb_orientation(c){pi=3.141592653589793;twopi=2*pi;rad=pi/180;dEarthMeanRadius=6371.01;dAstronomicalUnit=149597890;udtTimeiYear=c.year.value-0;udtTimeiMonth=c.month.value-0;udtTimeiDay=c.day.value-0;udtTimedHours=c.hour.value-0;udtTimedMinutes=c.minute.value-0;udtTimedSeconds=c.second.value-0;udtLocationdLongitude=c.longitude.value-0;udtLocationdLatitude=c.latitude.value-0;modazi=(c.modazi.value-0)*rad;modtilt=(c.modtilt.value-0)*rad;dDecimalHours=udtTimedHours+(udtTimedMinutes+udtTimedSeconds/
60)/60;liAux1=trunc((udtTimeiMonth-14)/12);liAux2=trunc(1461*(udtTimeiYear+4800+liAux1)/4)+trunc(367*(udtTimeiMonth-2-12*liAux1)/12)-trunc(3*trunc((udtTimeiYear+4900+liAux1)/100)/4)+udtTimeiDay-32075;dJulianDate=liAux2-0.5+dDecimalHours/24;dElapsedJulianDays=dJulianDate-2451545;dOmega=2.1429-0.0010394594*dElapsedJulianDays;dMeanLongitude=4.895063+0.017202791698*dElapsedJulianDays;dMeanAnomaly=6.24006+0.0172019699*dElapsedJulianDays;dEclipticLongitude=dMeanLongitude+0.03341607*Math.sin(dMeanAnomaly)+
3.4894E-4*Math.sin(2*dMeanAnomaly)-1.134E-4-2.03E-5*Math.sin(dOmega);dEclipticObliquity=0.4090928-6.214E-9*dElapsedJulianDays+3.96E-5*Math.cos(dOmega);dSin_EclipticLongitude=Math.sin(dEclipticLongitude);dY=Math.cos(dEclipticObliquity)*dSin_EclipticLongitude;dX=Math.cos(dEclipticLongitude);dRightAscension=Math.atan2(dY,dX);0>dRightAscension&&(dRightAscension+=twopi);dDeclination=Math.asin(Math.sin(dEclipticObliquity)*dSin_EclipticLongitude);dGreenwichMeanSiderealTime=6.6974243242+0.0657098283*dElapsedJulianDays+
dDecimalHours;dLocalMeanSiderealTime=(15*dGreenwichMeanSiderealTime+udtLocationdLongitude)*rad;dHourAngle=dLocalMeanSiderealTime-dRightAscension;dLatitudeInRadians=udtLocationdLatitude*rad;dCos_Latitude=Math.cos(dLatitudeInRadians);dSin_Latitude=Math.sin(dLatitudeInRadians);dCos_HourAngle=Math.cos(dHourAngle);udtSunCoordinatesdZenithAngle=Math.acos(dCos_Latitude*dCos_HourAngle*Math.cos(dDeclination)+Math.sin(dDeclination)*dSin_Latitude);dY=-Math.sin(dHourAngle);dX=Math.tan(dDeclination)*dCos_Latitude-
dSin_Latitude*dCos_HourAngle;udtSunCoordinatesdAzimuth=Math.atan2(dY,dX);0>udtSunCoordinatesdAzimuth&&(udtSunCoordinatesdAzimuth+=twopi);dParallax=dEarthMeanRadius/dAstronomicalUnit*Math.sin(udtSunCoordinatesdZenithAngle);udtSunCoordinatesdZenithAngle+=dParallax;udtSunCoordinatesdelevation=pi/2-udtSunCoordinatesdZenithAngle;fraction=Math.cos(udtSunCoordinatesdelevation)*Math.sin(modtilt)*Math.cos(udtSunCoordinatesdAzimuth-modazi)+Math.sin(udtSunCoordinatesdelevation)*Math.cos(modtilt);airmass=1/Math.cos(udtSunCoordinatesdZenithAngle);
Sincident=FourDec(1.353*Math.pow(0.7,Math.pow(airmass,0.678)));c.elevation.value=FourDec(udtSunCoordinatesdelevation/rad);c.azimuth.value=FourDec(udtSunCoordinatesdAzimuth/rad);c.zenith.value=FourDec(udtSunCoordinatesdZenithAngle/rad);c.airmass.value=FourDec(airmass);c.Sincident.value=FourDec(Sincident);c.Smodule.value=FourDec(Sincident*fraction);c.fraction.value=FourDec(fraction)}function ni(c){T=c-0;return(5.29E19*Math.pow(T/300,2.54)*Math.exp(-6726/T)).toExponential(3)}
function DiffusionLength(c){tb=c.tb.value-0;D=c.D.value-0;return FourDec(Math.sqrt(D*tb*100))}function Lifetime(c){L=c.L.value-0;D=c.D.value-0;return FourDec(L*L/(100*D))}function diode_current(c){I0=c.I0.value-0;n=c.n.value-0;T=c.T.value-0;V=c.V.value-0;return(I0*(Math.exp(qc*V/(n*kb*T))-1)).toExponential(4)}function sc_current(c){I0=c.I0.value-0;IL=c.IL.value-0;n=c.n.value-0;T=c.T.value-0;V=c.V.value-0;return FourDec(IL-I0*(Math.exp(qc*V/(n*kb*T))-1))}
function Voc1(c){I0=c.I0.value-0;IL=c.IL.value-0;n=c.n.value-0;T=c.T.value-0;return threeDec(n*kb*T/qc*Math.log(IL/I0+1))}function ImVoc(c){NA=c.NA.value-0;deltan=c.deltan.value-0;ni=c.ni.value-0;n=1;T=c.T.value-0;return threeDec(n*kb*T/qc*Math.log((NA+deltan)*deltan/(ni*ni)))}function voc_FF(c){Voc=c.Voc.value-0;n=c.n.value-0;T=c.T.value-0;k=1.38E-23;q=1.6E-19;little_voc=q/(n*k*T)*Voc;c.FFo.value=FourDec((little_voc-Math.log(little_voc+0.72))/(little_voc+1))}
function voc_FF_norm(c){Voc=c.Voc.value-0;n=c.n.value-0;T=c.T.value-0;k=1.38E-23;q=1.6E-19;c.Normalisedvoc.value=FourDec(q/(n*k*T)*Voc);voc=c.Normalisedvoc.value-0;c.FF2.value=FourDec((voc-Math.log(voc+0.72))/(voc+1))}
function FillFactors(c){Voc=c.Voc.value-0;n=c.n.value-0;T=c.T.value-0;k=1.38E-23;q=1.6E-19;little_voc=q/(n*k*T)*Voc;c.FFo.value=FourDec((little_voc-Math.log(little_voc+0.72))/(little_voc+1));Isc=c.Isc.value-0;FFo=c.FFo.value-0;k=1.38E-23;q=1.6E-19;LRs=c.LRs.value-0;n=c.n.value-0;T=c.T.value-0;RCH=FourDec(Voc/Isc);c.RCH.value=RCH;rs=FourDec(LRs/RCH);c.rs.value=rs;c.FFap.value=FourDec(FFo*(1-rs));c.FFacs.value=FourDec(FFo*(1-1.1*rs)+Math.pow(rs,2)/5.4);little_voc=q/(n*k*T)*Voc;c.little_voc.value=FourDec(little_voc)}
function FillFactor(c){voc=c.voc.value-0;vmp=c.vmp.value-0;isc=c.isc.value-0;imp=c.imp.value-0;c.FF.value=FourDec(imp*vmp/(voc*isc))}
function FillFactors_Rsh(c){Voc=c.Voc.value-0;n=c.n.value-0;T=c.T.value-0;k=1.38E-23;q=1.6E-19;little_voc=q/(n*k*T)*Voc;c.FFo.value=FourDec((little_voc-Math.log(little_voc+0.72))/(little_voc+1));Isc=c.Isc.value-0;FFo=c.FFo.value-0;LRsh=c.LRsh.value-0;RCH=FourDec(Voc/Isc);c.RCH.value=RCH;rsh=FourDec(LRsh/RCH);c.rsh.value=rsh;c.FFap.value=FourDec(FFo*(1-1/rsh));c.little_voc.value=FourDec(little_voc);c.FFacsh.value=FourDec(FFo*(1-(little_voc+0.7)*FFo/(little_voc*rsh)))}
function FillFactors_RsRsh(c){Voc=c.Voc.value-0;Isc=c.Isc.value-0;k=1.38E-23;q=1.6E-19;LRs=c.LRs.value-0;LRsh=c.LRsh.value-0;n=c.n.value-0;T=c.T.value-0;little_voc=q/(n*k*T)*Voc;FFo=FourDec((little_voc-Math.log(little_voc+0.72))/(little_voc+1));c.FFo.value=FourDec((little_voc-Math.log(little_voc+0.72))/(little_voc+1));RCH=FourDec(Voc/Isc);c.RCH.value=RCH;rs=FourDec(LRs/RCH);c.rs.value=rs;rsh=FourDec(LRsh/RCH);c.rsh.value=rsh;c.FFap.value=FourDec(FFo*(1-rs)*(1-1/rsh));c.FFacs.value=FourDec(FFo*(1-
1.1*rs)+Math.pow(rs,2)/5.4);little_voc=q/(n*k*T)*Voc;c.little_voc.value=FourDec(little_voc);c.FFacsh.value=FourDec(FFo*(1-(little_voc+0.7)*FFo/(little_voc*rsh)));c.FFacboth.value=FourDec(c.FFacs.value*(1-(little_voc+0.7)*c.FFacs.value/(little_voc*rsh)))}function getlifetime_ptype(c){C=c.conc.value-0;D=c.dop.value-0;return Math.round(1E6/((C+D)*(6E-25*Math.pow(D,0.65)+3E-27*Math.pow(C,0.8)+9.5E-15)))}
function getlifetime_ntype(c){C=c.conc.value-0;D=c.dop.value-0;return Math.round(1E6/((C+D)*(1.8E-24*Math.pow(D,0.65)+3E-27*Math.pow(C,0.8)+9.5E-15)))}function Maximum_Power(c){voc=c.voc.value-0;isc=c.isc.value-0;ff=c.ff.value-0;pin=c.pin.value-0;c.Pmax.value=FourDec(isc*voc*ff);c.eff.value=FourDec(100*isc*voc*ff/pin)}function Optimald(c){l=c.l.value-0;n1=c.n1.value-0;return FourDec(l/(4*n1))}function Optimaln(c){n0=c.n0.value-0;n2=c.n2.value-0;return FourDec(Math.sqrt(n0*n2))}
function FresnelRef(c,e){with(Math)return R=0.5*(pow(tan(c-e)/tan(c+e),2)+sqr(sin(c-e))/sqr(sin(c+e)))}function Snell(c){n1=c.n1.value-0;n2=c.n2.value-0;t1=c.t1.value-0;t2=FourDec(Math.asin(n1/n2*Math.sin(t1*Math.PI/180)));c.t2.value=FourDec(180/Math.PI*t2);R=FresnelRef(t1*Math.PI/180,t2);c.R.value=FourDec(R);c.T.value=FourDec(1-R)}function Critical(c){n2=c.n2.value-0;n1=c.n1.value-0;return FourDec(180/Math.PI*Math.asin(n2/n1))}
function CellTemp(c){Tair=c.Tair.value-0;NOCT=c.NOCT.value-0;S=c.S.value-0;return FourDec((NOCT-20)/80*S+Tair)}function SheetResistivity(c){bulk=c.bulk.value-0;thickness=1E-4*(c.thickness.value-0);return(bulk/thickness).toFixed(4)}function BulkFromSheet(c){sheet=c.sheet.value-0;thickness=1E-4*(c.thickness.value-0);return(sheet*thickness).toFixed(4)}
function dataWindow(c){OpenWindow=window.open("","newwin","height=600, width=800,toolbar=no,scrollbars=1,menubar=no");OpenWindow.document.write("<TITLE>JGraph Data</TITLE>");OpenWindow.document.write("<BODY BGCOLOR=white>");OpenWindow.document.write("<p>Select the data below and copy with ctrl-c. It can then be pasted into Excel etc.</p>");OpenWindow.document.write('<form><textarea cols="80" rows="30">');OpenWindow.document.write(c);OpenWindow.document.write("</textarea></form></BODY></HTML>");OpenWindow.document.close();
self.name="main"}function Resistivity(c,e,f){ni2=1E20;Nmin=ni2/c;q=1.602E-19;return FourDec(1/(q*e*c+q*f*Nmin))}function Diffusivity(c){return TwoDec(0.02586*c)}
function Mobility(c){N=c.N.value-0;max=1417;min=60;Nref=964E14;a=0.664;electron_maj=min+(max-min)/(1+Math.pow(N/Nref,a));N=c.N.value-0;max=1417;min=160;Nref=56E15;a=0.647;electron_min=min+(max-min)/(1+Math.pow(N/Nref,a));N=c.N.value-0;max=470;min=37.4;Nref=282E15;a=0.642;hole_maj=min+(max-min)/(1+Math.pow(N/Nref,a));c.hole_maj.value=OneDec(hole_maj);N=c.N.value-0;max=470;min=155;Nref=1E17;a=0.9;hole_min=min+(max-min)/(1+Math.pow(N/Nref,a));c.electron_maj.value=OneDec(electron_maj);c.electron_min.value=
OneDec(electron_min);c.hole_maj.value=OneDec(hole_maj);c.hole_min.value=OneDec(hole_min);c.electron_maj_diff.value=Diffusivity(electron_maj);c.electron_min_diff.value=Diffusivity(electron_min);c.hole_maj_diff.value=Diffusivity(hole_maj);c.hole_min_diff.value=Diffusivity(hole_min);c.ntype_res.value=Resistivity(N,electron_maj,hole_min);c.ptype_res.value=Resistivity(N,hole_maj,electron_min)}function OneDec(c){return Math.round(10*c)/10}function TwoDec(c){return Math.round(100*c)/100}
function threeDec(c){return Math.round(1E3*c)/1E3}function FourDec(c){return Math.round(1E4*c)/1E4}function scientificNotation(c,e){return c.toPrecision(e)};
