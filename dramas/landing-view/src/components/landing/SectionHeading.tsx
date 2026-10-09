type SectionHeadingProps = {
    id?: string;
    kicker: string;
    heading: string;
    supporting?: string;
    align?: 'center' | 'start';
};

export function SectionHeading({id, kicker, heading, supporting, align = 'center'}: SectionHeadingProps) {
    //
    return (
        <div className={`section-heading section-heading--${align}`} data-reveal="up">
            <span className="eyebrow">{kicker}</span>
            <h2 id={id}>{heading}</h2>
            {supporting ? <p>{supporting}</p> : null}
        </div>
    );
}
