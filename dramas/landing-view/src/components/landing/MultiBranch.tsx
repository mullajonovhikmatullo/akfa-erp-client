import {ArrowLeftRight, Building2, Check, Crown, UserCog} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';
import {SectionHeading} from './SectionHeading';

export function MultiBranch() {
    //
    const {t} = useI18n();
    const branches = t.branches;

    return (
        <section className="section section--tint" aria-labelledby="branches-heading">
            <div className="container split">
                <div className="split__copy">
                    <SectionHeading id="branches-heading" align="start" kicker={branches.kicker} heading={branches.heading} supporting={branches.supporting}/>
                    <ul className="check-list" data-reveal="up">
                        {branches.points.map((point) => <li key={point}><Check size={16} aria-hidden="true"/>{point}</li>)}
                    </ul>
                </div>

                <div className="org" data-reveal="scale" aria-hidden="true">
                    <div className="org__owner">
                        <span className="feature-icon feature-icon--blue"><Crown size={18}/></span>
                        <div><b>{branches.owner}</b><small>{branches.ownerNote}</small></div>
                    </div>
                    <div className="org__links"><i/><i/><i/></div>
                    <div className="org__branches">
                        {branches.branchNames.map((name) => (
                            <div className="org__branch" key={name}>
                                <span className="org__branch-name"><Building2 size={15}/>{name}</span>
                                <span className="org__admin"><UserCog size={14}/>{branches.admin}</span>
                                <small>{branches.adminNote}</small>
                            </div>
                        ))}
                    </div>
                    <div className="org__transfer">
                        <ArrowLeftRight size={16}/>
                        <b>{branches.transfer}</b>
                        <span>{branches.transferNote}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
