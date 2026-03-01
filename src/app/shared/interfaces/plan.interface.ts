/** Shape of a subscription plan — shared between Onboard and Landing pricing. */
export interface Plan {
    id: string;
    nombre: string;
    precio: string;
    periodo: string;
    destacado: boolean;
    features: string[];
    /** CTA button label (e.g. "Comienza gratis", "Elegir Profesional") */
    cta: string;
    /** Optional Material Icon name shown on the landing pricing card */
    icon?: string;
}
