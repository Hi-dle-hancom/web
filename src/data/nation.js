// src/data/nation.js

const countries = [
  { code: "US", name: "United States (US)", phoneCode: "+1" },
  { code: "CA", name: "Canada (CA)", phoneCode: "+1" },
  { code: "GB", name: "United Kingdom (GB)", phoneCode: "+44" },
  { code: "FR", name: "France (FR)", phoneCode: "+33" },
  { code: "DE", name: "Deutschland (DE)", phoneCode: "+49" },
  { code: "IT", name: "Italia (IT)", phoneCode: "+39" },
  { code: "ES", name: "España (ES)", phoneCode: "+34" },
  { code: "JP", name: "日本 (JP)", phoneCode: "+81" },
  { code: "CN", name: "中国 (CN)", phoneCode: "+86" },
  { code: "IN", name: "भारत (IN)", phoneCode: "+91" }, // Hindi for India
  { code: "AU", name: "Australia (AU)", phoneCode: "+61" },
  { code: "NZ", name: "New Zealand (NZ)", phoneCode: "+64" },
  { code: "KR", name: "대한민국 (KR)", phoneCode: "+82" },
  { code: "BR", name: "Brasil (BR)", phoneCode: "+55" },
  { code: "MX", name: "México (MX)", phoneCode: "+52" },
  { code: "AR", name: "Argentina (AR)", phoneCode: "+54" },
  { code: "ZA", name: "South Africa (ZA)", phoneCode: "+27" },
  { code: "EG", name: "مصر (EG)", phoneCode: "+20" }, // Arabic for Egypt
  { code: "NG", name: "Nigeria (NG)", phoneCode: "+234" },
  { code: "KE", name: "Kenya (KE)", phoneCode: "+254" },
  { code: "RU", name: "Россия (RU)", phoneCode: "+7" }, // Russian for Russia
  { code: "SE", name: "Sverige (SE)", phoneCode: "+46" }, // Swedish for Sweden
  { code: "NO", name: "Norge (NO)", phoneCode: "+47" }, // Norwegian for Norway
  { code: "DK", name: "Danmark (DK)", phoneCode: "+45" }, // Danish for Denmark
  { code: "FI", name: "Suomi (FI)", phoneCode: "+358" }, // Finnish for Finland
  { code: "NL", name: "Nederland (NL)", phoneCode: "+31" }, // Dutch for Netherlands
  { code: "BE", name: "België (BE)", phoneCode: "+32" }, // Dutch for Belgium
  { code: "CH", name: "Schweiz (CH)", phoneCode: "+41" }, // German for Switzerland
  { code: "AT", name: "Österreich (AT)", phoneCode: "+43" }, // German for Austria
  { code: "PL", name: "Polska (PL)", phoneCode: "+48" }, // Polish for Poland
  { code: "CZ", name: "Česko (CZ)", phoneCode: "+420" }, // Czech for Czech Republic
  { code: "HU", name: "Magyarország (HU)", phoneCode: "+36" }, // Hungarian for Hungary
  { code: "GR", name: "Ελλάδα (GR)", phoneCode: "+30" }, // Greek for Greece
  { code: "PT", name: "Portugal (PT)", phoneCode: "+351" },
  { code: "IE", name: "Ireland (IE)", phoneCode: "+353" },
  { code: "SG", name: "Singapore (SG)", phoneCode: "+65" },
  { code: "MY", name: "Malaysia (MY)", phoneCode: "+60" },
  { code: "TH", name: "ประเทศไทย (TH)", phoneCode: "+66" }, // Thai for Thailand
  { code: "VN", name: "Việt Nam (VN)", phoneCode: "+84" }, // Vietnamese for Vietnam
  { code: "ID", name: "Indonesia (ID)", phoneCode: "+62" },
  { code: "PH", name: "Philippines (PH)", phoneCode: "+63" },
  { code: "SA", name: "المملكة العربية السعودية (SA)", phoneCode: "+966" }, // Arabic for Saudi Arabia
  { code: "AE", name: "الإمارات العربية المتحدة (AE)", phoneCode: "+971" }, // Arabic for UAE
  { code: "TR", name: "Türkiye (TR)", phoneCode: "+90" }, // Turkish for Turkey
  { code: "IL", name: "ישראל (IL)", phoneCode: "+972" }, // Hebrew for Israel
  { code: "IR", name: "ایران (IR)", phoneCode: "+98" }, // Persian for Iran
  { code: "PK", name: "پاکستان (PK)", phoneCode: "+92" }, // Urdu for Pakistan
  { code: "BD", name: "বাংলাদেশ (BD)", phoneCode: "+880" }, // Bengali for Bangladesh
  { code: "LK", name: "ශ්‍රී ලංකාව (LK)", phoneCode: "+94" }, // Sinhala for Sri Lanka
  { code: "NP", name: "नेपाल (NP)", phoneCode: "+977" }, // Nepali for Nepal
  { code: "MN", name: "Монгол Улс (MN)", phoneCode: "+976" }, // Mongolian for Mongolia
  { code: "KZ", name: "Қазақстан (KZ)", phoneCode: "+7" }, // Kazakh for Kazakhstan
  { code: "UZ", name: "Oʻzbekiston (UZ)", phoneCode: "+998" }, // Uzbek for Uzbekistan
  { code: "UA", name: "Україна (UA)", phoneCode: "+380" }, // Ukrainian for Ukraine
  { code: "RO", name: "România (RO)", phoneCode: "+40" }, // Romanian for Romania
  { code: "BG", name: "България (BG)", phoneCode: "+359" }, // Bulgarian for Bulgaria
  { code: "HR", name: "Hrvatska (HR)", phoneCode: "+385" }, // Croatian for Croatia
  { code: "RS", name: "Србија (RS)", phoneCode: "+381" }, // Serbian for Serbia
  { code: "BA", name: "Bosna i Hercegovina (BA)", phoneCode: "+387" }, // Bosnian for Bosnia and Herzegovina
  { code: "SI", name: "Slovenija (SI)", phoneCode: "+386" }, // Slovenian for Slovenia
  { code: "SK", name: "Slovensko (SK)", phoneCode: "+421" }, // Slovak for Slovakia
  { code: "LT", name: "Lietuva (LT)", phoneCode: "+370" }, // Lithuanian for Lithuania
  { code: "LV", name: "Latvija (LV)", phoneCode: "+371" }, // Latvian for Latvia
  { code: "EE", name: "Eesti (EE)", phoneCode: "+372" }, // Estonian for Estonia
  { code: "IS", name: "Ísland (IS)", phoneCode: "+354" }, // Icelandic for Iceland
  { code: "LU", name: "Lëtzebuerg (LU)", phoneCode: "+352" }, // Luxembourgish for Luxembourg
  { code: "MT", name: "Malta (MT)", phoneCode: "+356" },
  { code: "CY", name: "Κύπρος (CY)", phoneCode: "+357" }, // Greek for Cyprus
  { code: "AZ", name: "Azərbaycan (AZ)", phoneCode: "+994" }, // Azerbaijani for Azerbaijan
  { code: "GE", name: "საქართველო (GE)", phoneCode: "+995" }, // Georgian for Georgia
  { code: "AM", name: "Հայաստան (AM)", phoneCode: "+374" }, // Armenian for Armenia
  { code: "IQ", name: "العراق (IQ)", phoneCode: "+964" }, // Arabic for Iraq
  { code: "SY", name: "سوريا (SY)", phoneCode: "+963" }, // Arabic for Syria
  { code: "LB", name: "لبنان (LB)", phoneCode: "+961" }, // Arabic for Lebanon
  { code: "JO", name: "الأردن (JO)", phoneCode: "+962" }, // Arabic for Jordan
  { code: "KW", name: "الكويت (KW)", phoneCode: "+965" }, // Arabic for Kuwait
  { code: "QA", name: "قطر (QA)", phoneCode: "+974" }, // Arabic for Qatar
  { code: "BH", name: "البحرين (BH)", phoneCode: "+973" }, // Arabic for Bahrain
  { code: "OM", name: "عُمان (OM)", phoneCode: "+968" }, // Arabic for Oman
  { code: "YE", name: "اليمن (YE)", phoneCode: "+967" }, // Arabic for Yemen
  { code: "DZ", name: "الجزائر (DZ)", phoneCode: "+213" }, // Arabic for Algeria
  { code: "MA", name: "المغرب (MA)", phoneCode: "+212" }, // Arabic for Morocco
  { code: "TN", name: "تونس (TN)", phoneCode: "+216" }, // Arabic for Tunisia
  { code: "LY", name: "ليبيا (LY)", phoneCode: "+218" }, // Arabic for Libya
  { code: "SD", name: "السودان (SD)", phoneCode: "+249" }, // Arabic for Sudan
  { code: "ET", name: "ኢትዮጵያ (ET)", phoneCode: "+251" }, // Amharic for Ethiopia
  { code: "SO", name: "Soomaaliya (SO)", phoneCode: "+252" }, // Somali for Somalia
  { code: "TZ", name: "Tanzania (TZ)", phoneCode: "+255" },
  { code: "UG", name: "Uganda (UG)", phoneCode: "+256" },
  { code: "RW", name: "Rwanda (RW)", phoneCode: "+250" },
  { code: "CD", name: "Congo-Kinshasa (CD)", phoneCode: "+243" },
  { code: "AO", name: "Angola (AO)", phoneCode: "+244" },
  { code: "ZM", name: "Zambia (ZM)", phoneCode: "+260" },
  { code: "ZW", name: "Zimbabwe (ZW)", phoneCode: "+263" },
  { code: "MZ", name: "Moçambique (MZ)", phoneCode: "+258" }, // Portuguese for Mozambique
  { code: "MG", name: "Madagasikara (MG)", phoneCode: "+261" }, // Malagasy for Madagascar
  { code: "MU", name: "Mauritius (MU)", phoneCode: "+230" },
  { code: "FJ", name: "Fiji (FJ)", phoneCode: "+679" },
  { code: "PG", name: "Papua Niugini (PG)", phoneCode: "+675" }, // Tok Pisin for Papua New Guinea
  { code: "SB", name: "Solomon Islands (SB)", phoneCode: "+677" },
];

export default countries;
