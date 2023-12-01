

CREATE TABLE Region (
	RegionId INTEGER PRIMARY KEY,
	Name TEXT NOT NULL,
	[Order] INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0,
	CreatedBy TEXT NOT NULL,
	CreatedDateTime TEXT NOT NULL,
	LastModifiedBy TEXT NOT NULL,
	LastModifiedDateTime TEXT NOT NULL); 


INSERT INTO Region VALUES(1, 'CQ', 2, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(2, 'NQ', 4, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(3, 'SEQ', 7, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(4, 'LHI', 8, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(5, 'NSW', 3, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(6, 'CORP', 1, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(7, 'ISLANDS', 15, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(8, 'WA', 5, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(9, 'GC', 13, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(10, 'NT', 12, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(11, 'FNQ', 11, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(12, 'SA', 6, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(13, 'VIC', 9, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(14, 'CROC TENT', 17, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(15, 'ACTIVE', 10, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(16, 'SC', 14, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 
INSERT INTO Region VALUES(17, 'CROC SHOP', 16, 0, 'init', '03/11/2023, 00:00:00 pm', 'init', '03/11/2023, 00:00:00 pm'); 

ALTER TABLE Customer ADD COLUMN  RegionId INTEGER;


UPDATE Customer SET RegionId=1 WHERE CustomerId=18;
UPDATE Customer SET RegionId=1 WHERE CustomerId=21;
UPDATE Customer SET RegionId=2 WHERE CustomerId=23;
UPDATE Customer SET RegionId=1 WHERE CustomerId=38;
UPDATE Customer SET RegionId=2 WHERE CustomerId=85;
UPDATE Customer SET RegionId=1 WHERE CustomerId=117;
UPDATE Customer SET RegionId=1 WHERE CustomerId=138;
UPDATE Customer SET RegionId=1 WHERE CustomerId=158;
UPDATE Customer SET RegionId=3 WHERE CustomerId=170;
UPDATE Customer SET RegionId=4 WHERE CustomerId=172;
UPDATE Customer SET RegionId=5 WHERE CustomerId=181;
UPDATE Customer SET RegionId=2 WHERE CustomerId=219;
UPDATE Customer SET RegionId=3 WHERE CustomerId=220;
UPDATE Customer SET RegionId=2 WHERE CustomerId=226;
UPDATE Customer SET RegionId=4 WHERE CustomerId=252;
UPDATE Customer SET RegionId=2 WHERE CustomerId=253;
UPDATE Customer SET RegionId=3 WHERE CustomerId=260;
UPDATE Customer SET RegionId=3 WHERE CustomerId=261;
UPDATE Customer SET RegionId=4 WHERE CustomerId=266;
UPDATE Customer SET RegionId=6 WHERE CustomerId=299;
UPDATE Customer SET RegionId=3 WHERE CustomerId=314;
UPDATE Customer SET RegionId=6 WHERE CustomerId=352;
UPDATE Customer SET RegionId=7 WHERE CustomerId=363;
UPDATE Customer SET RegionId=4 WHERE CustomerId=366;
UPDATE Customer SET RegionId=2 WHERE CustomerId=375;
UPDATE Customer SET RegionId=1 WHERE CustomerId=392;
UPDATE Customer SET RegionId=2 WHERE CustomerId=418;
UPDATE Customer SET RegionId=8 WHERE CustomerId=434;
UPDATE Customer SET RegionId=9 WHERE CustomerId=497;
UPDATE Customer SET RegionId=3 WHERE CustomerId=535;
UPDATE Customer SET RegionId=2 WHERE CustomerId=542;
UPDATE Customer SET RegionId=3 WHERE CustomerId=558;
UPDATE Customer SET RegionId=6 WHERE CustomerId=607;
UPDATE Customer SET RegionId=10 WHERE CustomerId=619;
UPDATE Customer SET RegionId=6 WHERE CustomerId=644;
UPDATE Customer SET RegionId=6 WHERE CustomerId=705;
UPDATE Customer SET RegionId=4 WHERE CustomerId=748;
UPDATE Customer SET RegionId=6 WHERE CustomerId=752;
UPDATE Customer SET RegionId=4 WHERE CustomerId=754;
UPDATE Customer SET RegionId=11 WHERE CustomerId=840;
UPDATE Customer SET RegionId=4 WHERE CustomerId=851;
UPDATE Customer SET RegionId=6 WHERE CustomerId=902;
UPDATE Customer SET RegionId=2 WHERE CustomerId=945;
UPDATE Customer SET RegionId=1 WHERE CustomerId=949;
UPDATE Customer SET RegionId=3 WHERE CustomerId=992;
UPDATE Customer SET RegionId=6 WHERE CustomerId=996;
UPDATE Customer SET RegionId=8 WHERE CustomerId=1012;
UPDATE Customer SET RegionId=2 WHERE CustomerId=1106;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1134;
UPDATE Customer SET RegionId=4 WHERE CustomerId=1231;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1345;
UPDATE Customer SET RegionId=1 WHERE CustomerId=1355;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1373;
UPDATE Customer SET RegionId=5 WHERE CustomerId=1380;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1382;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1387;
UPDATE Customer SET RegionId=2 WHERE CustomerId=1411;
UPDATE Customer SET RegionId=2 WHERE CustomerId=1412;
UPDATE Customer SET RegionId=4 WHERE CustomerId=1478;
UPDATE Customer SET RegionId=5 WHERE CustomerId=1497;
UPDATE Customer SET RegionId=3 WHERE CustomerId=1545;
UPDATE Customer SET RegionId=3 WHERE CustomerId=1561;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1596;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1605;
UPDATE Customer SET RegionId=5 WHERE CustomerId=1640;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1707;
UPDATE Customer SET RegionId=2 WHERE CustomerId=1735;
UPDATE Customer SET RegionId=2 WHERE CustomerId=1758;
UPDATE Customer SET RegionId=3 WHERE CustomerId=1767;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1776;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1777;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1780;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1796;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1814;
UPDATE Customer SET RegionId=2 WHERE CustomerId=1819;
UPDATE Customer SET RegionId=1 WHERE CustomerId=1854;
UPDATE Customer SET RegionId=4 WHERE CustomerId=1932;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1949;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1962;
UPDATE Customer SET RegionId=6 WHERE CustomerId=1969;
UPDATE Customer SET RegionId=5 WHERE CustomerId=1989;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2004;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2073;
UPDATE Customer SET RegionId=5 WHERE CustomerId=2082;
UPDATE Customer SET RegionId=5 WHERE CustomerId=2106;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2154;
UPDATE Customer SET RegionId=10 WHERE CustomerId=2184;
UPDATE Customer SET RegionId=5 WHERE CustomerId=2267;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2331;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2354;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2384;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2385;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2456;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2461;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2463;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2468;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2474;
UPDATE Customer SET RegionId=8 WHERE CustomerId=2493;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2532;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2617;
UPDATE Customer SET RegionId=8 WHERE CustomerId=2626;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2643;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2676;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2680;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2681;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2684;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2685;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2715;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2721;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2723;
UPDATE Customer SET RegionId=8 WHERE CustomerId=2732;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2738;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2740;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2780;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2795;
UPDATE Customer SET RegionId=3 WHERE CustomerId=2808;
UPDATE Customer SET RegionId=8 WHERE CustomerId=2836;
UPDATE Customer SET RegionId=5 WHERE CustomerId=2853;
UPDATE Customer SET RegionId=5 WHERE CustomerId=2859;
UPDATE Customer SET RegionId=1 WHERE CustomerId=2868;
UPDATE Customer SET RegionId=12 WHERE CustomerId=2916;
UPDATE Customer SET RegionId=12 WHERE CustomerId=2919;
UPDATE Customer SET RegionId=12 WHERE CustomerId=2920;
UPDATE Customer SET RegionId=12 WHERE CustomerId=2925;
UPDATE Customer SET RegionId=12 WHERE CustomerId=2926;
UPDATE Customer SET RegionId=12 WHERE CustomerId=2937;
UPDATE Customer SET RegionId=6 WHERE CustomerId=2946;
UPDATE Customer SET RegionId=5 WHERE CustomerId=2952;
UPDATE Customer SET RegionId=8 WHERE CustomerId=2956;
UPDATE Customer SET RegionId=13 WHERE CustomerId=2960;
UPDATE Customer SET RegionId=12 WHERE CustomerId=2974;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3002;
UPDATE Customer SET RegionId=12 WHERE CustomerId=3033;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3035;
UPDATE Customer SET RegionId=11 WHERE CustomerId=3078;
UPDATE Customer SET RegionId=8 WHERE CustomerId=3091;
UPDATE Customer SET RegionId=2 WHERE CustomerId=3106;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3111;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3123;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3145;
UPDATE Customer SET RegionId=1 WHERE CustomerId=3173;
UPDATE Customer SET RegionId=2 WHERE CustomerId=3195;
UPDATE Customer SET RegionId=5 WHERE CustomerId=3201;
UPDATE Customer SET RegionId=12 WHERE CustomerId=3209;
UPDATE Customer SET RegionId=8 WHERE CustomerId=3212;
UPDATE Customer SET RegionId=8 WHERE CustomerId=3215;
UPDATE Customer SET RegionId=11 WHERE CustomerId=3225;
UPDATE Customer SET RegionId=12 WHERE CustomerId=3233;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3248;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3249;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3282;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3289;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3304;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3335;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3336;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3353;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3369;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3374;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3376;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3427;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3442;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3450;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3460;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3486;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3516;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3517;
UPDATE Customer SET RegionId=14 WHERE CustomerId=3519;
UPDATE Customer SET RegionId=1 WHERE CustomerId=3527;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3529;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3530;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3533;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3567;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3594;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3620;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3630;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3656;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3683;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3692;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3712;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3724;
UPDATE Customer SET RegionId=12 WHERE CustomerId=3726;
UPDATE Customer SET RegionId=11 WHERE CustomerId=3749;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3800;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3810;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3814;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3816;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3818;
UPDATE Customer SET RegionId=1 WHERE CustomerId=3820;
UPDATE Customer SET RegionId=1 WHERE CustomerId=3826;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3829;
UPDATE Customer SET RegionId=1 WHERE CustomerId=3832;
UPDATE Customer SET RegionId=1 WHERE CustomerId=3858;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3893;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3903;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3917;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3931;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3934;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3936;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3946;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3959;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3971;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3979;
UPDATE Customer SET RegionId=4 WHERE CustomerId=3992;
UPDATE Customer SET RegionId=6 WHERE CustomerId=3995;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4021;
UPDATE Customer SET RegionId=8 WHERE CustomerId=4023;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4027;
UPDATE Customer SET RegionId=12 WHERE CustomerId=4032;
UPDATE Customer SET RegionId=12 WHERE CustomerId=4040;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4041;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4042;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4047;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4056;
UPDATE Customer SET RegionId=8 WHERE CustomerId=4091;
UPDATE Customer SET RegionId=1 WHERE CustomerId=4095;
UPDATE Customer SET RegionId=12 WHERE CustomerId=4114;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4158;
UPDATE Customer SET RegionId=1 WHERE CustomerId=4192;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4225;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4228;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4231;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4256;
UPDATE Customer SET RegionId=1 WHERE CustomerId=4259;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4264;
UPDATE Customer SET RegionId=3 WHERE CustomerId=4268;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4291;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4293;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4302;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4331;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4338;
UPDATE Customer SET RegionId=13 WHERE CustomerId=4339;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4342;
UPDATE Customer SET RegionId=1 WHERE CustomerId=4359;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4389;
UPDATE Customer SET RegionId=13 WHERE CustomerId=4402;
UPDATE Customer SET RegionId=13 WHERE CustomerId=4405;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4408;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4424;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4438;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4440;
UPDATE Customer SET RegionId=1 WHERE CustomerId=4446;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4452;
UPDATE Customer SET RegionId=8 WHERE CustomerId=4498;
UPDATE Customer SET RegionId=5 WHERE CustomerId=4499;
UPDATE Customer SET RegionId=9 WHERE CustomerId=4512;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4514;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4527;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4530;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4557;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4581;
UPDATE Customer SET RegionId=12 WHERE CustomerId=4582;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4591;
UPDATE Customer SET RegionId=5 WHERE CustomerId=4618;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4624;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4628;
UPDATE Customer SET RegionId=3 WHERE CustomerId=4641;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4646;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4655;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4656;
UPDATE Customer SET RegionId=5 WHERE CustomerId=4699;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4710;
UPDATE Customer SET RegionId=13 WHERE CustomerId=4721;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4738;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4740;
UPDATE Customer SET RegionId=1 WHERE CustomerId=4744;
UPDATE Customer SET RegionId=13 WHERE CustomerId=4774;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4794;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4813;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4814;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4834;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4847;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4869;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4875;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4886;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4892;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4902;
UPDATE Customer SET RegionId=3 WHERE CustomerId=4906;
UPDATE Customer SET RegionId=15 WHERE CustomerId=4918;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4934;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4952;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4966;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4970;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4982;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4983;
UPDATE Customer SET RegionId=15 WHERE CustomerId=4986;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4989;
UPDATE Customer SET RegionId=6 WHERE CustomerId=4995;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5009;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5010;
UPDATE Customer SET RegionId=8 WHERE CustomerId=5031;
UPDATE Customer SET RegionId=2 WHERE CustomerId=5045;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5089;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5090;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5103;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5114;
UPDATE Customer SET RegionId=15 WHERE CustomerId=5117;
UPDATE Customer SET RegionId=12 WHERE CustomerId=5125;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5127;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5131;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5142;
UPDATE Customer SET RegionId=3 WHERE CustomerId=5154;
UPDATE Customer SET RegionId=5 WHERE CustomerId=5159;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5166;
UPDATE Customer SET RegionId=8 WHERE CustomerId=5170;
UPDATE Customer SET RegionId=5 WHERE CustomerId=5171;
UPDATE Customer SET RegionId=5 WHERE CustomerId=5187;
UPDATE Customer SET RegionId=16 WHERE CustomerId=5196;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5216;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5230;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5235;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5241;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5247;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5248;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5251;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5258;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5270;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5277;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5280;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5281;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5295;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5300;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5301;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5306;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5333;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5337;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5384;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5389;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5401;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5410;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5415;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5424;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5447;
UPDATE Customer SET RegionId=13 WHERE CustomerId=5448;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5451;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5455;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5463;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5477;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5479;
UPDATE Customer SET RegionId=8 WHERE CustomerId=5490;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5502;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5516;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5535;
UPDATE Customer SET RegionId=1 WHERE CustomerId=5574;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5587;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5599;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5601;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5610;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5617;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5649;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5660;
UPDATE Customer SET RegionId=1 WHERE CustomerId=5675;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5688;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5689;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5693;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5709;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5712;
UPDATE Customer SET RegionId=1 WHERE CustomerId=5715;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5746;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5750;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5760;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5766;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5768;
UPDATE Customer SET RegionId=3 WHERE CustomerId=5795;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5806;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5811;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5815;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5834;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5849;
UPDATE Customer SET RegionId=13 WHERE CustomerId=5895;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5899;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5900;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5913;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5934;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5943;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5962;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5971;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5973;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5989;
UPDATE Customer SET RegionId=6 WHERE CustomerId=5993;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6000;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6002;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6004;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6013;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6037;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6040;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6046;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6048;
UPDATE Customer SET RegionId=16 WHERE CustomerId=6059;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6064;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6066;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6070;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6084;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6085;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6088;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6092;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6096;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6108;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6112;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6114;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6127;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6128;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6132;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6133;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6141;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6153;
UPDATE Customer SET RegionId=8 WHERE CustomerId=6159;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6178;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6185;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6216;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6226;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6227;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6236;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6263;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6268;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6270;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6277;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6282;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6287;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6299;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6301;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6307;
UPDATE Customer SET RegionId=5 WHERE CustomerId=6312;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6315;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6317;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6319;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6340;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6347;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6360;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6378;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6381;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6410;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6415;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6416;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6417;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6418;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6427;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6434;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6435;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6436;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6439;
UPDATE Customer SET RegionId=12 WHERE CustomerId=6441;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6444;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6455;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6456;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6461;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6465;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6470;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6475;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6481;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6482;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6493;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6497;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6503;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6518;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6529;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6549;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6553;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6579;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6595;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6603;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6616;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6625;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6629;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6644;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6647;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6651;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6660;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6662;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6666;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6667;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6677;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6681;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6682;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6688;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6696;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6711;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6719;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6735;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6744;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6758;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6761;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6762;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6764;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6770;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6774;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6788;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6792;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6797;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6802;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6809;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6814;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6818;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6820;
UPDATE Customer SET RegionId=5 WHERE CustomerId=6827;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6829;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6859;
UPDATE Customer SET RegionId=2 WHERE CustomerId=6864;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6882;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6886;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6902;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6918;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6941;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6946;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6949;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6952;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6961;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6969;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6971;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6973;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6976;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6980;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6982;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6986;
UPDATE Customer SET RegionId=6 WHERE CustomerId=6999;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7003;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7008;
UPDATE Customer SET RegionId=1 WHERE CustomerId=7015;
UPDATE Customer SET RegionId=1 WHERE CustomerId=7022;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7034;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7036;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7040;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7044;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7048;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7049;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7051;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7053;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7059;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7062;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7069;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7073;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7076;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7086;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7087;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7093;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7095;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7097;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7116;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7128;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7130;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7133;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7135;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7136;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7143;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7149;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7155;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7158;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7163;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7167;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7171;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7172;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7176;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7177;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7179;
UPDATE Customer SET RegionId=5 WHERE CustomerId=7184;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7189;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7190;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7217;
UPDATE Customer SET RegionId=1 WHERE CustomerId=7222;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7223;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7224;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7232;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7242;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7243;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7249;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7254;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7267;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7272;
UPDATE Customer SET RegionId=17 WHERE CustomerId=7298;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7306;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7309;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7313;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7315;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7321;
UPDATE Customer SET RegionId=2 WHERE CustomerId=7325;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7329;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7340;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7347;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7350;
UPDATE Customer SET RegionId=8 WHERE CustomerId=7351;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7353;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7356;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7363;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7365;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7366;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7372;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7374;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7387;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7388;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7393;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7398;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7406;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7417;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7419;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7422;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7423;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7426;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7430;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7436;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7437;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7438;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7439;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7443;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7448;
UPDATE Customer SET RegionId=12 WHERE CustomerId=7452;
UPDATE Customer SET RegionId=5 WHERE CustomerId=7455;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7457;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7461;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7464;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7465;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7468;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7469;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7472;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7473;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7476;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7483;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7500;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7501;
UPDATE Customer SET RegionId=13 WHERE CustomerId=7503;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7504;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7505;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7507;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7508;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7509;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7512;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7522;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7531;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7542;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7543;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7549;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7556;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7559;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7563;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7565;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7567;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7568;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7579;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7584;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7587;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7594;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7599;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7606;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7608;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7609;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7611;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7633;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7637;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7639;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7640;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7648;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7650;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7651;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7663;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7668;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7670;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7672;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7679;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7684;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7687;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7695;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7706;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7708;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7709;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7710;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7711;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7713;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7715;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7716;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7729;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7731;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7732;
UPDATE Customer SET RegionId=3 WHERE CustomerId=7734;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7737;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7738;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7748;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7749;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7750;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7752;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7758;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7761;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7764;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7767;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7771;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7773;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7774;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7779;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7784;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7786;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7789;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7791;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7793;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7794;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7796;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7798;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7806;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7807;
UPDATE Customer SET RegionId=1 WHERE CustomerId=7810;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7811;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7813;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7815;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7817;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7818;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7823;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7824;
UPDATE Customer SET RegionId=1 WHERE CustomerId=7825;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7827;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7828;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7831;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7832;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7833;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7834;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7837;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7842;
UPDATE Customer SET RegionId=1 WHERE CustomerId=7843;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7846;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7847;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7848;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7854;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7857;
UPDATE Customer SET RegionId=5 WHERE CustomerId=7860;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7861;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7867;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7870;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7874;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7877;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7878;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7879;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7880;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7881;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7886;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7887;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7888;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7889;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7891;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7895;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7897;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7899;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7900;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7903;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7907;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7910;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7914;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7920;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7922;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7923;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7927;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7929;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7931;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7937;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7939;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7940;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7944;
UPDATE Customer SET RegionId=1 WHERE CustomerId=7948;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7950;
UPDATE Customer SET RegionId=5 WHERE CustomerId=7952;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7954;
UPDATE Customer SET RegionId=2 WHERE CustomerId=7955;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7956;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7957;
UPDATE Customer SET RegionId=4 WHERE CustomerId=7964;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7976;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7977;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7980;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7982;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7983;
UPDATE Customer SET RegionId=1 WHERE CustomerId=7988;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7990;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7991;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7992;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7996;
UPDATE Customer SET RegionId=6 WHERE CustomerId=7998;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8000;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8001;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8006;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8017;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8019;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8021;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8023;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8025;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8026;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8030;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8033;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8035;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8038;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8039;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8041;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8042;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8043;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8044;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8050;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8053;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8060;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8064;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8069;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8070;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8073;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8076;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8078;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8086;
UPDATE Customer SET RegionId=5 WHERE CustomerId=8087;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8089;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8092;
UPDATE Customer SET RegionId=1 WHERE CustomerId=8094;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8098;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8102;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8103;
UPDATE Customer SET RegionId=8 WHERE CustomerId=8108;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8111;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8114;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8115;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8116;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8119;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8125;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8126;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8128;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8130;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8131;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8133;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8135;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8136;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8137;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8138;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8139;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8140;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8141;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8142;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8143;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8144;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8145;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8146;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8147;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8148;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8149;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8150;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8151;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8152;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8153;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8154;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8155;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8156;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8157;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8158;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8159;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8160;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8161;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8162;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8166;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8167;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8168;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8169;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8170;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8171;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8172;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8173;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8174;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8175;
UPDATE Customer SET RegionId=5 WHERE CustomerId=8176;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8177;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8178;
UPDATE Customer SET RegionId=1 WHERE CustomerId=8179;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8180;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8181;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8182;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8183;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8184;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8185;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8186;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8187;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8188;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8189;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8190;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8191;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8192;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8193;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8194;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8195;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8196;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8197;
UPDATE Customer SET RegionId=5 WHERE CustomerId=8198;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8199;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8200;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8201;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8202;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8203;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8204;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8205;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8206;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8207;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8208;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8209;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8210;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8211;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8212;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8213;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8214;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8215;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8216;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8217;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8218;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8219;
UPDATE Customer SET RegionId=8 WHERE CustomerId=8220;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8221;
UPDATE Customer SET RegionId=8 WHERE CustomerId=8222;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8223;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8224;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8225;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8226;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8227;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8228;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8229;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8230;
UPDATE Customer SET RegionId=1 WHERE CustomerId=8231;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8232;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8233;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8234;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8235;
UPDATE Customer SET RegionId=1 WHERE CustomerId=8236;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8237;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8238;
UPDATE Customer SET RegionId=1 WHERE CustomerId=8239;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8240;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8241;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8242;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8243;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8244;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8245;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8246;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8247;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8248;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8249;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8250;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8251;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8252;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8253;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8254;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8255;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8256;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8257;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8258;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8259;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8260;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8261;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8262;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8263;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8264;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8265;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8266;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8267;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8268;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8269;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8270;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8271;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8272;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8273;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8274;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8275;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8276;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8277;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8278;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8279;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8280;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8281;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8282;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8283;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8284;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8285;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8286;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8287;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8288;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8289;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8290;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8291;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8292;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8293;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8294;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8295;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8296;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8297;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8298;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8299;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8300;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8301;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8302;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8303;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8304;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8305;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8306;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8307;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8308;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8310;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8311;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8312;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8313;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8314;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8315;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8316;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8317;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8318;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8319;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8320;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8321;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8322;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8323;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8324;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8325;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8326;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8327;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8328;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8329;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8330;
UPDATE Customer SET RegionId=2 WHERE CustomerId=8331;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8332;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8333;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8334;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8335;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8336;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8337;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8338;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8339;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8340;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8341;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8342;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8343;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8345;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8346;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8347;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8348;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8349;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8350;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8351;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8352;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8353;
UPDATE Customer SET RegionId=5 WHERE CustomerId=8354;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8356;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8357;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8358;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8359;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8360;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8361;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8362;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8363;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8364;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8365;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8366;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8367;
UPDATE Customer SET RegionId=5 WHERE CustomerId=8368;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8369;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8370;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8371;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8372;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8373;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8374;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8375;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8376;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8377;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8378;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8379;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8380;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8381;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8382;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8383;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8384;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8385;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8386;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8388;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8390;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8391;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8392;
UPDATE Customer SET RegionId=1 WHERE CustomerId=8393;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8394;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8395;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8396;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8397;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8398;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8399;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8400;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8401;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8402;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8403;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8404;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8405;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8406;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8407;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8408;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8409;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8410;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8411;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8412;
UPDATE Customer SET RegionId=12 WHERE CustomerId=8413;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8414;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8415;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8416;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8417;
UPDATE Customer SET RegionId=2 WHERE CustomerId=8418;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8419;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8420;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8421;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8422;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8423;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8424;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8425;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8426;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8427;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8428;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8429;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8430;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8431;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8432;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8433;
UPDATE Customer SET RegionId=3 WHERE CustomerId=8434;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8435;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8436;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8437;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8438;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8439;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8440;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8441;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8442;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8443;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8444;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8445;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8446;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8447;
UPDATE Customer SET RegionId=5 WHERE CustomerId=8448;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8449;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8450;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8451;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8452;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8453;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8454;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8455;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8456;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8457;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8458;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8459;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8460;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8461;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8462;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8463;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8464;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8465;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8466;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8467;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8468;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8469;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8470;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8471;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8472;
UPDATE Customer SET RegionId=4 WHERE CustomerId=8473;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8474;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8475;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8476;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8477;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8478;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8479;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8480;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8481;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8482;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8483;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8484;
UPDATE Customer SET RegionId=8 WHERE CustomerId=8485;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8486;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8487;
UPDATE Customer SET RegionId=1 WHERE CustomerId=8488;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8489;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8490;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8491;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8492;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8493;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8494;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8495;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8496;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8497;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8498;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8499;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8500;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8501;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8502;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8503;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8504;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8505;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8506;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8507;
UPDATE Customer SET RegionId=13 WHERE CustomerId=8508;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8509;
UPDATE Customer SET RegionId=5 WHERE CustomerId=8510;
UPDATE Customer SET RegionId=5 WHERE CustomerId=8511;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8513;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8514;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8515;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8516;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8517;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8518;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8519;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8520;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8521;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8522;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8523;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8524;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8525;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8526;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8527;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8528;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8529;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8530;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8531;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8532;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8533;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8534;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8535;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8536;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8537;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8538;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8539;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8540;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8541;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8542;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8543;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8544;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8545;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8546;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8547;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8548;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8549;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8550;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8552;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8553;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8554;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8555;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8556;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8557;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8558;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8559;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8560;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8561;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8562;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8564;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8565;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8566;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8567;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8568;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8569;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8570;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8571;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8572;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8573;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8574;
UPDATE Customer SET RegionId=1 WHERE CustomerId=8575;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8576;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8577;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8578;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8579;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8580;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8581;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8582;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8583;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8584;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8585;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8586;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8587;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8588;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8589;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8590;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8591;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8592;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8593;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8594;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8595;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8596;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8597;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8598;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8599;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8600;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8601;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8602;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8603;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8604;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8605;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8606;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8607;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8608;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8609;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8610;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8611;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8612;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8613;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8614;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8615;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8616;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8617;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8618;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8619;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8620;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8621;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8622;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8623;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8624;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8625;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8626;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8627;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8628;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8629;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8630;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8631;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8632;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8633;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8634;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8635;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8636;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8638;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8639;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8640;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8641;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8642;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8643;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8644;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8645;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8646;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8647;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8648;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8649;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8650;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8651;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8652;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8653;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8654;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8655;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8656;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8657;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8658;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8659;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8660;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8661;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8662;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8663;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8664;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8665;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8666;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8667;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8668;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8669;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8670;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8671;
UPDATE Customer SET RegionId=15 WHERE CustomerId=8672;
UPDATE Customer SET RegionId=15 WHERE CustomerId=8673;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8674;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8675;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8676;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8677;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8678;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8679;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8680;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8681;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8682;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8683;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8684;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8685;
UPDATE Customer SET RegionId=10 WHERE CustomerId=8686;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8687;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8688;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8689;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8690;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8691;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8692;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8693;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8694;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8695;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8696;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8697;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8698;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8699;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8700;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8701;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8702;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8703;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8704;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8706;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8707;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8708;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8709;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8710;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8711;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8712;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8713;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8714;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8715;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8716;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8717;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8718;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8719;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8720;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8721;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8722;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8723;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8724;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8725;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8726;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8727;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8728;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8729;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8730;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8731;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8733;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8734;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8735;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8737;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8738;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8739;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8740;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8741;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8742;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8743;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8744;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8745;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8746;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8747;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8748;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8749;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8750;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8751;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8752;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8753;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8754;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8755;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8756;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8757;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8758;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8759;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8760;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8761;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8762;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8763;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8764;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8765;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8766;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8767;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8768;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8769;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8770;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8771;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8772;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8773;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8774;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8775;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8776;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8777;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8778;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8779;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8780;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8781;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8782;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8783;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8784;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8786;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8787;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8788;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8789;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8790;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8792;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8793;
UPDATE Customer SET RegionId=6 WHERE CustomerId=8794;

ALTER TABLE Orders ADD COLUMN RegionId INTEGER;

UPDATE Orders SET RegionId=(SELECT RegionId FROM Customer WHERE Customer.CustomerId=Orders.CustomerId);

ALTER TABLE SalesTotal ADD COLUMN RegionId INTEGER;

UPDATE SalesTotal SET RegionId=(SELECT RegionId FROM Customer WHERE Customer.CustomerId=SalesTotal.CustomerId);



DROP VIEW "main"."OrderSearch_View";
CREATE VIEW OrderSearch_View AS 

SELECT OrderId, OrderNumber, Customer.CustomerId, Customer.Company AS CustomerName, 
		OrderDate, Repeat, New, Buyin, Done, Terms, 
		Orders.SalesRep, Orders.RegionId, Orders.Notes, DeliveryDate,
		(SELECT IFNULL(fpd.code, '') || ',' || IFNULL(bpd.code, '') || ',' || IFNULL(ppd.code, '') || ',' || IFNULL(spd.code, '')
			||  IFNULL(fed.code, '') || ',' || IFNULL(bed.code, '') || ',' || IFNULL(ped.code, '') || ',' || IFNULL(sed.code, '')	
			||  IFNULL(ftd.code, '') || ',' || IFNULL(btd.code, '') || ',' || IFNULL(ptd.code, '') || ',' || IFNULL(std.code, '')	
			FROM OrderGarment 
				LEFT JOIN PrintDesign      fpd ON fpd.PrintDesignId     =FrontPrintDesignId
				LEFT JOIN PrintDesign      bpd ON bpd.PrintDesignId     =BackPrintDesignId
				LEFT JOIN PrintDesign      ppd ON ppd.PrintDesignId     =PocketPrintDesignId
				LEFT JOIN PrintDesign      spd ON spd.PrintDesignId     =SleevePrintDesignId
				LEFT JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId=FrontEmbroideryDesignId
				LEFT JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId=BackEmbroideryDesignId
				LEFT JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=PocketEmbroideryDesignId
				LEFT JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=SleeveEmbroideryDesignId
				LEFT JOIN TransferDesign   ftd ON ftd.TransferDesignId  =FrontTransferDesignId
				LEFT JOIN TransferDesign   btd ON btd.TransferDesignId  =BackTransferDesignId
				LEFT JOIN TransferDesign   ptd ON ptd.TransferDesignId  =PocketTransferDesignId
				LEFT JOIN TransferDesign   std ON std.TransferDesignId  =SleeveTransferDesignId
				WHERE OrderGarment.OrderId=Orders.OrderId) AS Designs,
		(SELECT IFNULL(fpd.Code, '') || ' ' || IFNULL(fpd.Notes, '') || '; ' || IFNULL(bpd.Code, '') || ' ' || IFNULL(bpd.Notes, '') || '; ' || IFNULL(ppd.Code, '') || ' ' || IFNULL(ppd.Notes, '') || '; ' || IFNULL(spd.Code, '') || ' ' || IFNULL(spd.Notes, '')
			 || IFNULL(fed.Code, '') || ' ' || IFNULL(fed.Notes, '') || '; ' || IFNULL(bed.Code, '') || ' ' || IFNULL(bed.Notes, '') || '; ' || IFNULL(ped.Code, '') || ' ' || IFNULL(ped.Notes, '') || '; ' || IFNULL(sed.Code, '') || ' ' || IFNULL(sed.Notes, '')
			 || IFNULL(ftd.Code, '') || ' ' || IFNULL(ftd.Notes, '') || '; ' || IFNULL(btd.Code, '') || ' ' || IFNULL(btd.Notes, '') || '; ' || IFNULL(ptd.Code, '') || ' ' || IFNULL(ptd.Notes, '') || '; ' || IFNULL(std.Code, '') || ' ' || IFNULL(std.Notes, '')
			FROM OrderGarment 
				LEFT JOIN PrintDesign      fpd ON fpd.PrintDesignId     =FrontPrintDesignId
				LEFT JOIN PrintDesign      bpd ON bpd.PrintDesignId     =BackPrintDesignId
				LEFT JOIN PrintDesign      ppd ON ppd.PrintDesignId     =PocketPrintDesignId
				LEFT JOIN PrintDesign      spd ON spd.PrintDesignId     =SleevePrintDesignId
				LEFT JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId=FrontEmbroideryDesignId
				LEFT JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId=BackEmbroideryDesignId
				LEFT JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=PocketEmbroideryDesignId
				LEFT JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=SleeveEmbroideryDesignId
				LEFT JOIN TransferDesign   ftd ON ftd.TransferDesignId  =FrontTransferDesignId
				LEFT JOIN TransferDesign   btd ON btd.TransferDesignId  =BackTransferDesignId
				LEFT JOIN TransferDesign   ptd ON ptd.TransferDesignId  =PocketTransferDesignId
				LEFT JOIN TransferDesign   std ON std.TransferDesignId  =SleeveTransferDesignId
				WHERE OrderGarment.OrderId=Orders.OrderId) AS DesignsDisplay
FROM Orders
LEFT JOIN Customer USING (CustomerId)
WHERE Orders.Deleted=0  
	AND ProcessedDate IS NULL;


-- CREATE TRIGGER Order_Insert_Trigger
-- AFTER INSERT
-- ON Orders
-- BEGIN
-- INSERT INTO SalesTotal 
-- (OrderId, OrderNumber, CustomerId, SalesRep, OrderDate, Repeat, New, BuyIn, Terms, Delivery, Notes, CustomerOrderNumber, DateProcessed, DateInvoiced, Done, StockOrderId, RegionId)
-- VALUES 
-- (NEW.OrderId, NEW.OrderNumber, NEW.CustomerId, NEW.SalesRep, NEW.OrderDate, NEW.Repeat, NEW.New, NEW.BuyIn, NEW.Terms, NEW.DeliveryDate, NEW.Notes, NEW.CustomerOrderNumber, NEW.ProcessedDate, NEW.InvoiceDate, NEW.Done, NEW.StockOrderId, NEW.RegionId);
-- END;

-- CREATE TRIGGER Order_Update_Trigger
-- AFTER UPDATE
-- ON Orders
-- BEGIN
-- UPDATE SalesTotal SET
-- OrderNumber=NEW.OrderNumber, CustomerId=NEW.CustomerId, SalesRep=NEW.SalesRep,
-- OrderDate=NEW.OrderDate, Repeat=NEW.Repeat, New=NEW.New, BuyIn=NEW.BuyIn, Terms=NEW.Terms, Delivery=NEW.DeliveryDate,
-- Notes=NEW.Notes, CustomerOrderNumber=NEW.CustomerOrderNumber, DateProcessed=NEW.ProcessedDate, 
-- DateInvoiced=NEW.InvoiceDate, Done=NEW.Done, StockOrderId=NEW.StockOrderId, RegionId=NEW.RegionId
-- WHERE  OrderId=NEW.OrderId;
-- END;

-- CREATE TRIGGER OrderGarment_Insert_Trigger
-- AFTER INSERT
-- ON OrderGarment
-- BEGIN
-- INSERT INTO Sales
-- (OrderGarmentId, OrderId, GarmentId, 
-- FrontPrintDesignId, FrontScreenId, FrontScreen2Id,
-- BackPrintDesignId,BackScreenId,BackScreen2Id,
-- PocketPrintDesignId,PocketScreenId,PocketScreen2Id,
-- SleevePrintDesignId,SleeveScreenId,SleeveScreen2Id,
-- FrontEmbroideryDesignId,FrontUsbId,FrontUsb2Id,
-- BackEmbroideryDesignId,BackUsbId,BackUsb2Id,
-- PocketEmbroideryDesignId,PocketUsbId,PocketUsb2Id,
-- SleeveEmbroideryDesignId,SleeveUsbId,SleeveUsb2Id,
-- FrontTransferDesignId,FrontTransferNameId,FrontTransferName2Id,
-- BackTransferDesignId,BackTransferNameId,BackTransferName2Id,
-- PocketTransferDesignId,PocketTransferNameId,PocketTransferName2Id,
-- SleeveTransferDesignId,SleeveTransferNameId,SleeveTransferName2Id,
-- K0,K1,K2,K4,K6,K8,K10,K12,K14,K16,
-- W6,W8,W10,W12,W14,W16,W18,W20,W22,W24,W26,W28,
-- AXS,ASm,AM,AL,AXL,A2XL,A3XL,A4XL,A5XL,A6XL,A7XL,A8XL,
-- Price)
-- VALUES (
-- NEW.OrderGarmentId, NEW.OrderId, NEW.GarmentId,
-- NEW.FrontPrintDesignId, NEW.FrontScreenId, NEW.FrontScreen2Id,
-- NEW.BackPrintDesignId, NEW.BackScreenId, NEW.BackScreen2Id,
-- NEW.PocketPrintDesignId, NEW.PocketScreenId, NEW.PocketScreen2Id,
-- NEW.SleevePrintDesignId, NEW.SleeveScreenId, NEW.SleeveScreen2Id,
-- NEW.FrontEmbroideryDesignId, NEW.FrontUsbId, NEW.FrontUsb2Id,
-- NEW.BackEmbroideryDesignId, NEW.BackUsbId, NEW.BackUsb2Id,
-- NEW.PocketEmbroideryDesignId, NEW.PocketUsbId, NEW.PocketUsb2Id,
-- NEW.SleeveEmbroideryDesignId, NEW.SleeveUsbId, NEW.SleeveUsb2Id,
-- NEW.FrontTransferDesignId, NEW.FrontTransferNameId, NEW.FrontTransferName2Id,
-- NEW.BackTransferDesignId, NEW.BackTransferNameId, NEW.BackTransferName2Id,
-- NEW.PocketTransferDesignId, NEW.PocketTransferNameId, NEW.PocketTransferName2Id,
-- NEW.SleeveTransferDesignId, NEW.SleeveTransferNameId, NEW.SleeveTransferName2Id,
-- NEW.K0, NEW.K1, NEW.K2, NEW.K4, NEW.K6, NEW.K8, NEW.K10, NEW.K12, NEW.K14, NEW.K16,
-- NEW.W6, NEW.W8, NEW.W10, NEW.W12, NEW.W14, NEW.W16, NEW.W18, NEW.W20, NEW.W22, NEW.W24, NEW.W26, NEW.W28,
-- NEW.AXS, NEW.ASm, NEW.AM, NEW.AL, NEW.AXL, NEW.A2XL, NEW.A3XL, NEW.A4XL, NEW.A5XL, NEW.A6XL, NEW.A7XL, NEW.A8XL,
-- NEW.Price
-- );
-- END;

-- CREATE TRIGGER OrderGarment_Update_Trigger
-- AFTER UPDATE
-- ON OrderGarment
-- BEGIN
-- UPDATE Sales SET
-- OrderGarmentId=NEW.OrderGarmentId,
-- OrderId=NEW.OrderId, 
-- GarmentId=NEW.GarmentId,
-- FrontPrintDesignId=NEW.FrontPrintDesignId,
-- FrontScreenId=NEW.FrontScreenId,
-- FrontScreen2Id=NEW.FrontScreen2Id,
-- BackPrintDesignId=NEW.BackPrintDesignId,
-- BackScreenId=NEW.BackScreenId,
-- BackScreen2Id=NEW.BackScreen2Id,
-- PocketPrintDesignId=NEW.PocketPrintDesignId,
-- PocketScreenId=NEW.PocketScreenId,
-- PocketScreen2Id=NEW.PocketScreen2Id,
-- SleevePrintDesignId=NEW.SleevePrintDesignId,
-- SleeveScreenId=NEW.SleeveScreenId,
-- SleeveScreen2Id=NEW.SleeveScreen2Id,
-- FrontEmbroideryDesignId=NEW.FrontEmbroideryDesignId,
-- FrontUsbId=NEW.FrontUsbId,
-- FrontUsb2Id=NEW.FrontUsb2Id,
-- BackEmbroideryDesignId=NEW.BackEmbroideryDesignId,
-- BackUsbId=NEW.BackUsbId,
-- BackUsb2Id=NEW.BackUsb2Id,
-- PocketEmbroideryDesignId=NEW.PocketEmbroideryDesignId,
-- PocketUsbId=NEW.PocketUsbId,
-- PocketUsb2Id=NEW.PocketUsb2Id,
-- SleeveEmbroideryDesignId=NEW.SleeveEmbroideryDesignId,
-- SleeveUsbId=NEW.SleeveUsbId,
-- SleeveUsb2Id=NEW.SleeveUsb2Id,
-- FrontTransferDesignId=NEW.FrontTransferDesignId,
-- FrontTransferNameId=NEW.FrontTransferNameId,
-- FrontTransferName2Id=NEW.FrontTransferName2Id,
-- BackTransferDesignId=NEW.BackTransferDesignId,
-- BackTransferNameId=NEW.BackTransferNameId,
-- BackTransferName2Id=NEW.BackTransferName2Id,
-- PocketTransferDesignId=NEW.PocketTransferDesignId,
-- PocketTransferNameId=NEW.PocketTransferNameId,
-- PocketTransferName2Id=NEW.PocketTransferName2Id,
-- SleeveTransferDesignId=NEW.SleeveTransferDesignId,
-- SleeveTransferNameId=NEW.SleeveTransferNameId,
-- SleeveTransferName2Id=NEW.SleeveTransferName2Id,
-- K0=NEW.K0,
-- K1=NEW.K1,
-- K2=NEW.K2,
-- K4=NEW.K4,
-- K6=NEW.K6,
-- K8=NEW.K8,
-- K10=NEW.K10,
-- K12=NEW.K12,
-- K14=NEW.K14,
-- K16=NEW.K16,
-- W6=NEW.W6,
-- W8=NEW.W8,
-- W10=NEW.W10,
-- W12=NEW.W12,
-- W14=NEW.W14,
-- W16=NEW.W16,
-- W18=NEW.W18,
-- W20=NEW.W20,
-- W22=NEW.W22,
-- W24=NEW.W24,
-- W26=NEW.W26,
-- W28=NEW.W28,
-- AXS=NEW.AXS,
-- ASm=NEW.ASm,
-- AM=NEW.AM,
-- AL=NEW.AL,
-- AXL=NEW.AXL,
-- A2XL=NEW.A2XL,
-- A3XL=NEW.A3XL,
-- A4XL=NEW.A4XL,
-- A5XL=NEW.A5XL,
-- A6XL=NEW.A6XL,
-- A7XL=NEW.A7XL,
-- A8XL=NEW.A8XL,
-- Price=NEW.Price
-- WHERE OrderGarmentId=NEW.OrderGarmentId;
-- END;

