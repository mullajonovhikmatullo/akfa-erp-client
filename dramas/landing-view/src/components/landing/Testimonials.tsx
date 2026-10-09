import {useI18n} from '../../i18n/I18nProvider';

type Testimonial = { quote: string; name: string; store: string };

// TODO: add real, approved customer quotes. The block stays hidden while this list is empty.
const testimonials: Testimonial[] = [];

export function Testimonials() {
    //
    const {t} = useI18n();
    if (testimonials.length === 0) return null;

    return (
        <section className="section" aria-labelledby="testimonials-heading">
            <div className="container">
                <h2 id="testimonials-heading" className="section-heading section-heading--center">{t.testimonials.heading}</h2>
                <ul className="tiles">
                    {testimonials.map((item) => (
                        <li className="tile tile--quote" key={item.name}>
                            <blockquote>{item.quote}</blockquote>
                            <p><b>{item.name}</b> · {item.store}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
