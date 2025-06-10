
export interface FormData {
  coupleName: string;
  startDate: string;
  startTime: string;
  message: string;
  selectedPlan: string;
  couplePhotos: File[];
  musicUrl: string;
  email: string;
  urlSlug: string;
}

export interface ModalContent {
  title: string;
  message: string;
}
