export type RegistrationData = {
  fullName: string;
  phone: string;
  province: string;
  babyDate: string;
  referralCode: string;
  eventCode: string;

  consentMember: boolean;
  consentAptaclub: boolean;
  consentMarketing: boolean;
  consentDanone: boolean;
  consentAptaclubZalo: boolean;

  eligibleForDanoneCRM: boolean;
};
