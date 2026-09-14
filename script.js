/* =====================================================
   GESTION DES CULTES
===================================================== */


/* =====================================================
   VARIABLES
===================================================== */

let cultes = JSON.parse(
    localStorage.getItem("gestionCultes")
) || [];

let deferredPrompt = null;


/* =====================================================
   INITIALISATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {

        document.getElementById("loader").style.display = "none";

    }, 900);


    initialiserDate();

    initialiserAnnees();

    afficherCultes();

    mettreAJourDashboard();

    calculerPreview();

    afficherDateActuelle();

    enregistrerServiceWorker();

});


/* =====================================================
   DATE PAR DEFAUT
===================================================== */

function initialiserDate() {

    const date = document.getElementById("date");

    const aujourdHui = new Date();

    const annee =
        aujourdHui.getFullYear();

    const mois =
        String(aujourdHui.getMonth() + 1)
        .padStart(2, "0");

    const jour =
        String(aujourdHui.getDate())
        .padStart(2, "0");

    date.value =
        `${annee}-${mois}-${jour}`;

}


/* =====================================================
   DATE AFFICHAGE
===================================================== */

function afficherDateActuelle() {

    const element =
        document.getElementById("todayDate");

    const maintenant = new Date();

    element.textContent =
        maintenant.toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


/* =====================================================
   NAVIGATION
===================================================== */

document.querySelectorAll(".menu-btn")
.forEach(button => {

    button.addEventListener("click", () => {

        const page =
            button.dataset.page;

        showPage(page);

    });

});


function showPage(pageId) {

    document.querySelectorAll(".page")
    .forEach(page => {

        page.classList.remove("active");

    });


    document.querySelectorAll(".menu-btn")
    .forEach(button => {

        button.classList.remove("active");

    });


    const page =
        document.getElementById(pageId);

    if (page) {

        page.classList.add("active");

    }


    const button =
        document.querySelector(
            `[data-page="${pageId}"]`
        );

    if (button) {

        button.classList.add("active");

    }


    if (pageId === "rapports") {

        afficherRapport();

    }

}


/* =====================================================
   CALCUL TOTAL
===================================================== */

function calculerTotal(data) {

    return (

        Number(data.offrandes || 0) +

        Number(data.actionsGrace || 0) +

        Number(data.offrandesProphete || 0) +

        Number(data.construction || 0) +

        Number(data.alliance || 0) +

        Number(data.cartesSoutien || 0) +

        Number(data.dime || 0) +

        Number(data.carburant || 0) +

        Number(data.autres || 0) +

        Number(data.enveloppes || 0)

    );

}


/* =====================================================
   SOLDE CAISSE
===================================================== */

function calculerSolde(data) {

    const total =
        calculerTotal(data);

    return (

        total -

        Number(data.depenses || 0) -

        Number(data.offrandesProphete || 0)

    );

}


/* =====================================================
   FORMATAGE FC
===================================================== */

function formatFC(nombre) {

    return Number(nombre || 0)
        .toLocaleString("fr-FR")
        + " FC";

}


/* =====================================================
   PREVISUALISATION
===================================================== */

const champsNumeriques = [

    "offrandes",
    "actionsGrace",
    "offrandesProphete",
    "construction",
    "alliance",
    "cartesSoutien",
    "dime",
    "carburant",
    "autres",
    "enveloppes",
    "depenses"

];


champsNumeriques.forEach(id => {

    document.getElementById(id)
    .addEventListener("input", calculerPreview);

});


function recupererFormulaire() {

    return {

        date:
            document.getElementById("date").value,

        predicateur:
            document.getElementById("predicateur").value,

        offrandes:
            Number(document.getElementById("offrandes").value) || 0,

        actionsGrace:
            Number(document.getElementById("actionsGrace").value) || 0,

        offrandesProphete:
            Number(document.getElementById("offrandesProphete").value) || 0,

        construction:
            Number(document.getElementById("construction").value) || 0,

        alliance:
            Number(document.getElementById("alliance").value) || 0,

        cartesSoutien:
            Number(document.getElementById("cartesSoutien").value) || 0,

        dime:
            Number(document.getElementById("dime").value) || 0,

        carburant:
            Number(document.getElementById("carburant").value) || 0,

        autres:
            Number(document.getElementById("autres").value) || 0,

        enveloppes:
            Number(document.getElementById("enveloppes").value) || 0,

        depenses:
            Number(document.getElementById("depenses").value) || 0

    };

}


function calculerPreview() {

    const data =
        recupererFormulaire();

    const total =
        calculerTotal(data);

    const solde =
        calculerSolde(data);


    document.getElementById("previewTotal")
        .textContent =
        formatFC(total);


    document.getElementById("previewDepenses")
        .textContent =
        formatFC(data.depenses);


    document.getElementById("previewSolde")
        .textContent =
        formatFC(solde);

}


/* =====================================================
   ENREGISTREMENT
===================================================== */

document.getElementById("culteForm")
.addEventListener("submit", function(event) {

    event.preventDefault();


    const data =
        recupererFormulaire();


    if (!data.date || !data.predicateur) {

        afficherNotification(
            "Veuillez remplir la date et le prédicateur.",
            "⚠️"
        );

        return;

    }


    const editId =
        document.getElementById("editId").value;


    if (editId) {

        const index =
            cultes.findIndex(
                culte => culte.id == editId
            );


        if (index !== -1) {

            cultes[index] = {

                ...cultes[index],

                ...data

            };

            afficherNotification(
                "Culte modifié avec succès."
            );

        }

    } else {

        const nouveauCulte = {

            id:
                Date.now(),

            ...data,

            createdAt:
                new Date().toISOString()

        };


        cultes.push(nouveauCulte);


        afficherNotification(
            "Culte enregistré avec succès."
        );

    }


    sauvegarder();

    afficherCultes();

    mettreAJourDashboard();

    initialiserAnnees();

    resetForm();

});


/* =====================================================
   SAUVEGARDE LOCAL
===================================================== */

function sauvegarder() {

    localStorage.setItem(
        "gestionCultes",
        JSON.stringify(cultes)
    );

}


/* =====================================================
   AFFICHER LES CULTES
===================================================== */

function afficherCultes() {

    const tbody =
        document.getElementById("cultesTable");


    const recherche =
        document.getElementById("searchInput")
        ?.value
        .toLowerCase() || "";


    const annee =
        document.getElementById("filterYear")
        ?.value || "all";


    let resultat =
        [...cultes].reverse();


    if (recherche) {

        resultat =
            resultat.filter(culte =>

                culte.predicateur
                    .toLowerCase()
                    .includes(recherche)

                ||

                culte.date
                    .includes(recherche)

            );

    }


    if (annee !== "all") {

        resultat =
            resultat.filter(culte =>

                culte.date.startsWith(annee)

            );

    }


    if (resultat.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="empty-state">

                        Aucun culte trouvé.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        resultat.map(culte => {

            const total =
                calculerTotal(culte);

            const solde =
                calculerSolde(culte);


            return `

                <tr>

                    <td>
                        <strong>
                            ${formatDate(culte.date)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(culte.predicateur)}
                    </td>

                    <td>
                        ${formatFC(total)}
                    </td>

                    <td>
                        ${formatFC(culte.depenses)}
                    </td>

                    <td>
                        ${formatFC(culte.offrandesProphete)}
                    </td>

                    <td>
                        <strong style="color:#18a66a">
                            ${formatFC(solde)}
                        </strong>
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="small-action edit-btn"
                                onclick="modifierCulte(${culte.id})">

                                ✏️

                            </button>

                            <button
                                class="small-action delete-btn"
                                onclick="supprimerCulte(${culte.id})">

                                🗑️

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


/* =====================================================
   RECHERCHE
===================================================== */

document.getElementById("searchInput")
.addEventListener(
    "input",
    afficherCultes
);


document.getElementById("filterYear")
.addEventListener(
    "change",
    afficherCultes
);


/* =====================================================
   MODIFIER
===================================================== */

function modifierCulte(id) {

    const culte =
        cultes.find(
            element => element.id == id
        );


    if (!culte) return;


    document.getElementById("editId").value =
        culte.id;


    document.getElementById("date").value =
        culte.date;


    document.getElementById("predicateur").value =
        culte.predicateur;


    champsNumeriques.forEach(id => {

        document.getElementById(id).value =
            culte[id] || 0;

    });


    document.getElementById("formTitle")
        .textContent =
        "✏️ Modifier le culte";


    document.getElementById("cancelEdit")
        .style.display =
        "inline-block";


    calculerPreview();

    showPage("cultes");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   ANNULER MODIFICATION
===================================================== */

document.getElementById("cancelEdit")
.addEventListener(
    "click",
    resetForm
);


function resetForm() {

    document.getElementById("culteForm")
        .reset();

    document.getElementById("editId").value =
        "";

    document.getElementById("formTitle")
        .textContent =
        "➕ Nouveau culte";

    document.getElementById("cancelEdit")
        .style.display =
        "none";

    initialiserDate();

    calculerPreview();

}


/* =====================================================
   SUPPRIMER
===================================================== */

function supprimerCulte(id) {

    const culte =
        cultes.find(
            element => element.id == id
        );


    if (!culte) return;


    const confirmation =
        confirm(

            "⚠️ ATTENTION\n\n" +

            "Voulez-vous vraiment supprimer " +

            "le culte du " +

            formatDate(culte.date) +

            " ?\n\n" +

            "Cette opération ne pourra pas être annulée."

        );


    if (!confirmation) return;


    cultes =
        cultes.filter(
            element => element.id != id
        );


    sauvegarder();

    afficherCultes();

    mettreAJourDashboard();

    initialiserAnnees();


    afficherNotification(
        "Culte supprimé."
    );

}


/* =====================================================
   DASHBOARD
===================================================== */

function mettreAJourDashboard() {

    let total = 0;

    let depenses = 0;

    let solde = 0;


    cultes.forEach(culte => {

        total +=
            calculerTotal(culte);

        depenses +=
            Number(culte.depenses || 0);

        solde +=
            calculerSolde(culte);

    });


    document.getElementById("statTotal")
        .textContent =
        formatFC(total);


    document.getElementById("statDepenses")
        .textContent =
        formatFC(depenses);


    document.getElementById("statSolde")
        .textContent =
        formatFC(solde);


    document.getElementById("statCultes")
        .textContent =
        cultes.length;


    afficherResumeMois();

    afficherResumeAnnee();

    afficherDerniersCultes();

}


/* =====================================================
   RESUME MOIS
===================================================== */

function afficherResumeMois() {

    const maintenant =
        new Date();

    const mois =
        maintenant.getMonth() + 1;

    const annee =
        maintenant.getFullYear();


    const resultat =
        cultes.filter(culte => {

            const d =
                new Date(culte.date);

            return (

                d.getMonth() + 1 === mois &&

                d.getFullYear() === annee

            );

        });


    let total = 0;

    let depenses = 0;

    let solde = 0;


    resultat.forEach(culte => {

        total +=
            calculerTotal(culte);

        depenses +=
            Number(culte.depenses || 0);

        solde +=
            calculerSolde(culte);

    });


    document.getElementById("monthTotal")
        .textContent =
        formatFC(total);


    document.getElementById("monthExpenses")
        .textContent =
        formatFC(depenses);


    document.getElementById("monthBalance")
        .textContent =
        formatFC(solde);


    document.getElementById("monthSelector")
        .value =
        mois;

}


/* =====================================================
   SELECTEUR MOIS
===================================================== */

document.getElementById("monthSelector")
.addEventListener(
    "change",
    afficherMoisSelectionne
);


function afficherMoisSelectionne() {

    const mois =
        Number(
            document.getElementById(
                "monthSelector"
            ).value
        );


    const annee =
        new Date().getFullYear();


    const resultat =
        cultes.filter(culte => {

            const d =
                new Date(culte.date);

            return (

                d.getMonth() + 1 === mois &&

                d.getFullYear() === annee

            );

        });


    let total = 0;

    let depenses = 0;

    let solde = 0;


    resultat.forEach(culte => {

        total +=
            calculerTotal(culte);

        depenses +=
            Number(culte.depenses || 0);

        solde +=
            calculerSolde(culte);

    });


    document.getElementById("monthTotal")
        .textContent =
        formatFC(total);


    document.getElementById("monthExpenses")
        .textContent =
        formatFC(depenses);


    document.getElementById("monthBalance")
        .textContent =
        formatFC(solde);

}


/* =====================================================
   ANNEES
===================================================== */

function initialiserAnnees() {

    const annees = new Set();

    const anneeActuelle =
        new Date().getFullYear();

    annees.add(anneeActuelle);


    cultes.forEach(culte => {

        if (culte.date) {

            annees.add(
                new Date(culte.date)
                .getFullYear()
            );

        }

    });


    const liste =
        [...annees].sort(
            (a,b) => b-a
        );


    const selectors = [

        document.getElementById("yearSelector"),

        document.getElementById("filterYear"),

        document.getElementById("reportYear")

    ];


    selectors.forEach(select => {

        if (!select) return;


        const valeurActuelle =
            select.value;


        if (select.id === "filterYear") {

            select.innerHTML = `
                <option value="all">
                    Toutes les années
                </option>
            `;

        } else {

            select.innerHTML = "";

        }


        liste.forEach(annee => {

            const option =
                document.createElement("option");

            option.value =
                annee;

            option.textContent =
                annee;

            select.appendChild(option);

        });


        if (
            [...select.options]
            .some(o => o.value === valeurActuelle)
        ) {

            select.value =
                valeurActuelle;

        }

    });


    afficherResumeAnnee();

}


/* =====================================================
   ANNEE DASHBOARD
===================================================== */

document.getElementById("yearSelector")
.addEventListener(
    "change",
    afficherResumeAnnee
);


function afficherResumeAnnee() {

    const select =
        document.getElementById(
            "yearSelector"
        );


    const annee =
        Number(
            select.value ||
            new Date().getFullYear()
        );


    const resultat =
        cultes.filter(culte =>

            new Date(culte.date)
                .getFullYear() === annee

        );


    let total = 0;


    resultat.forEach(culte => {

        total +=
            calculerTotal(culte);

    });


    document.getElementById("yearTotal")
        .textContent =
        formatFC(total);


    const maximum =
        Math.max(
            ...cultes.map(c => calculerTotal(c)),
            1
        );


    const pourcentage =
        Math.min(
            100,
            Math.round(
                (total / maximum) * 100
            )
        );


    document.getElementById("progressBar")
        .style.width =
        pourcentage + "%";


    document.getElementById("progressText")
        .textContent =
        pourcentage + "%";

}


/* =====================================================
   DERNIERS CULTES
===================================================== */

function afficherDerniersCultes() {

    const container =
        document.getElementById(
            "recentCultes"
        );


    const derniers =
        [...cultes]
        .sort(
            (a,b) =>
                new Date(b.date) -
                new Date(a.date)
        )
        .slice(0,5);


    if (derniers.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                Aucun culte enregistré.

            </div>

        `;

        return;

    }


    container.innerHTML =
        derniers.map(culte => {

            return `

                <div class="recent-item">

                    <div>

                        <div class="recent-name">

                            ${escapeHTML(
                                culte.predicateur
                            )}

                        </div>

                        <div class="recent-date">

                            ${formatDate(
                                culte.date
                            )}

                        </div>

                    </div>

                    <div class="recent-solde">

                        ${formatFC(
                            calculerSolde(culte)
                        )}

                    </div>

                </div>

            `;

        }).join("");

}


/* =====================================================
   RAPPORT
===================================================== */

document.getElementById("reportYear")
.addEventListener(
    "change",
    afficherRapport
);


document.getElementById("reportMonth")
.addEventListener(
    "change",
    afficherRapport
);


function afficherRapport() {

    const annee =
        Number(
            document.getElementById(
                "reportYear"
            ).value
        );


    const mois =
        document.getElementById(
            "reportMonth"
        ).value;


    let resultat =
        cultes.filter(culte =>

            new Date(culte.date)
                .getFullYear() === annee

        );


    if (mois !== "all") {

        resultat =
            resultat.filter(culte =>

                new Date(culte.date)
                    .getMonth() + 1 === Number(mois)

            );

    }


    let total = 0;

    let depenses = 0;

    let proph = 0;

    let solde = 0;


    resultat.forEach(culte => {

        total +=
            calculerTotal(culte);

        depenses +=
            Number(culte.depenses || 0);

        proph +=
            Number(culte.offrandesProphete || 0);

        solde +=
            calculerSolde(culte);

    });


    const content =
        document.getElementById(
            "reportContent"
        );


    content.innerHTML = `

        <div class="report-summary">

            <div class="report-box">

                <span>
                    CULTES
                </span>

                <strong>
                    ${resultat.length}
                </strong>

            </div>

            <div class="report-box">

                <span>
                    TOTAL GÉNÉRAL
                </span>

                <strong>
                    ${formatFC(total)}
                </strong>

            </div>

            <div class="report-box">

                <span>
                    DÉPENSES
                </span>

                <strong>
                    ${formatFC(depenses)}
                </strong>

            </div>

            <div class="report-box">

                <span>
                    SOLDE CAISSE
                </span>

                <strong>
                    ${formatFC(solde)}
                </strong>

            </div>

        </div>


        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>Date</th>

                        <th>Prédicateur</th>

                        <th>Total</th>

                        <th>Dépenses</th>

                        <th>Prophète</th>

                        <th>Solde</th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        resultat.length === 0

                        ?

                        `
                        <tr>

                            <td colspan="6">

                                <div class="empty-state">

                                    Aucun résultat.

                                </div>

                            </td>

                        </tr>
                        `

                        :

                        resultat.map(culte => `

                            <tr>

                                <td>
                                    ${formatDate(culte.date)}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        culte.predicateur
                                    )}
                                </td>

                                <td>
                                    ${formatFC(
                                        calculerTotal(culte)
                                    )}
                                </td>

                                <td>
                                    ${formatFC(
                                        culte.depenses
                                    )}
                                </td>

                                <td>
                                    ${formatFC(
                                        culte.offrandesProphete
                                    )}
                                </td>

                                <td>
                                    ${formatFC(
                                        calculerSolde(culte)
                                    )}
                                </td>

                            </tr>

                        `).join("")

                    }

                </tbody>

            </table>

        </div>

    `;

}


/* =====================================================
   IMPRESSION
===================================================== */

function printReport() {

    window.print();

}


/* =====================================================
   SAUVEGARDE JSON
===================================================== */

function backupData() {

    const donnees =
        JSON.stringify(
            cultes,
            null,
            2
        );


    const blob =
        new Blob(
            [donnees],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const lien =
        document.createElement("a");


    const date =
        new Date()
        .toISOString()
        .slice(0,10);


    lien.href = url;

    lien.download =
        `sauvegarde-cultes-${date}.json`;


    lien.click();


    URL.revokeObjectURL(url);


    afficherNotification(
        "Sauvegarde téléchargée."
    );

}


/* =====================================================
   RESTAURATION
===================================================== */

function restoreData() {

    const input =
        document.getElementById(
            "restoreFile"
        );


    if (!input.files.length) {

        afficherNotification(
            "Choisissez d'abord une sauvegarde.",
            "⚠️"
        );

        return;

    }


    const fichier =
        input.files[0];


    const lecteur =
        new FileReader();


    lecteur.onload =
        function(event) {

            try {

                const donnees =
                    JSON.parse(
                        event.target.result
                    );


                if (!Array.isArray(donnees)) {

                    throw new Error();

                }


                const confirmation =
                    confirm(

                        "Les données actuelles seront remplacées.\n\n" +

                        "Voulez-vous continuer ?"

                    );


                if (!confirmation) return;


                cultes =
                    donnees;


                sauvegarder();

                initialiserAnnees();

                afficherCultes();

                mettreAJourDashboard();


                afficherNotification(
                    "Données restaurées avec succès."
                );


            } catch {

                afficherNotification(
                    "Fichier de sauvegarde invalide.",
                    "❌"
                );

            }

        };


    lecteur.readAsText(fichier);

}


/* =====================================================
   SUPPRESSION TOTALE
===================================================== */

function deleteAllData() {

    const confirmation =
        confirm(

            "⚠️ DANGER\n\n" +

            "Toutes les données des cultes seront supprimées.\n\n" +

            "Êtes-vous absolument certain ?"

        );


    if (!confirmation) return;


    const deuxieme =
        confirm(
            "Dernière confirmation : supprimer toutes les données ?"
        );


    if (!deuxieme) return;


    cultes = [];

    sauvegarder();

    afficherCultes();

    mettreAJourDashboard();

    initialiserAnnees();


    afficherNotification(
        "Toutes les données ont été supprimées.",
        "🗑️"
    );

}


/* =====================================================
   NOTIFICATION
===================================================== */

function afficherNotification(
    message,
    icone = "✓"
) {

    const notification =
        document.getElementById(
            "notification"
        );


    document.getElementById(
        "notificationText"
    ).textContent =
        message;


    document.getElementById(
        "notificationIcon"
    ).textContent =
        icone;


    notification.classList.add("show");


    setTimeout(() => {

        notification.classList.remove("show");

    }, 3000);

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {

    if (!date) return "";

    const d =
        new Date(date + "T00:00:00");


    return d.toLocaleDateString(
        "fr-FR"
    );

}


/* =====================================================
   PROTECTION HTML
===================================================== */

function escapeHTML(texte) {

    return String(texte || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   MODE SOMBRE
===================================================== */

document.getElementById("themeBtn")
.addEventListener("click", () => {

    document.body.classList.toggle(
        "dark-mode"
    );

});


/* =====================================================
   INSTALLATION PWA
===================================================== */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredPrompt = event;

        document.getElementById(
            "installBtn"
        ).style.display =
            "block";

    }
);


document.getElementById("installBtn")
.addEventListener(
    "click",
    async () => {

        if (!deferredPrompt) {

            afficherNotification(
                "Utilisez le menu du navigateur pour installer l'application.",
                "📱"
            );

            return;

        }


        deferredPrompt.prompt();


        const choix =
            await deferredPrompt.userChoice;


        deferredPrompt = null;

    }
);


/* =====================================================
   SERVICE WORKER
===================================================== */

function enregistrerServiceWorker() {

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker
            .register("service-worker.js")
            .then(() => {

                console.log(
                    "Application prête pour le mode hors connexion."
                );

            })
            .catch(error => {

                console.log(
                    "Service Worker :",
                    error
                );

            });

    }

}