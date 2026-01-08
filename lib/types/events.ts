export interface TrainingContent {
    text: string;
}

export interface LearningPoint {
    text: string;
}

export interface FAQ {
    question: string;
    answer: string;
}

export interface InstructorSocial {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
}

export interface Instructor {
    name: string;
    title: string;
    image: string;
    bio: string;
    social?: InstructorSocial;
}

export interface RelatedEvent {
    title: string;
    image: string;
    slug: string;
    badge?: string;
}

export interface Event {
    id: number;
    title: string;
    image: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    slug: string;
    description?: string;
    price?: number;
    videoUrl?: string;
    trainingContent?: TrainingContent[];
    learningPoints?: LearningPoint[];
    faqs?: FAQ[];
    instructors?: Instructor[];
    relatedEvents?: RelatedEvent[];
}

export interface SeoMeta {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
}

export interface Events {
    _id?: string;
    title: string;
    subtitle: string;
    events: Event[];
    seo?: SeoMeta;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateEventsDto {
    title: string;
    subtitle: string;
    events: Event[];
    seo?: SeoMeta;
}

export interface UpdateEventsDto extends Partial<CreateEventsDto> { }
