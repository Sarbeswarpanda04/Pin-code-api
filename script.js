/*
|--------------------------------------------------------------------------
| PinLocate - Main JavaScript
|--------------------------------------------------------------------------
| Pincode BO Locator
| Developer: Sarbeswar Panda
|--------------------------------------------------------------------------
*/


/* =========================================================================
   MOBILE MENU
========================================================================= */

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const menu =
    document.querySelector(".menu");

if (mobileMenuBtn && menu) {

    mobileMenuBtn.addEventListener("click", () => {

        menu.classList.toggle("active");

        const icon =
            mobileMenuBtn.querySelector("i");

        if (!icon) return;

        if (menu.classList.contains("active")) {

            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");

        } else {

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }

    });

}


/* =========================================================================
   PINCODE API
========================================================================= */

const API_BASE =
    "https://cdn.sarbeswarpanda.in/pincode/data/pincode_api_shards";

let INDEX = {};

let currentOffices = [];


/* =========================================================================
   DOM ELEMENTS
========================================================================= */

const form =
    document.getElementById("searchForm");

const input =
    document.getElementById("pincode");

const searchBtn =
    document.getElementById("searchBtn");

const status =
    document.getElementById("status");

const results =
    document.getElementById("results");

const resultsTitle =
    document.getElementById("resultsTitle");

const count =
    document.getElementById("count");


/* =========================================================================
   OFFICE DETAILS
========================================================================= */

const details =
    document.getElementById("details");

const selectedOffice =
    document.getElementById("selectedOffice");

const selectedSubtitle =
    document.getElementById("selectedSubtitle");

const selectedInfo =
    document.getElementById("selectedInfo");

const mapWrap =
    document.getElementById("mapWrap");

const closeDetails =
    document.getElementById("closeDetails");


/* =========================================================================
   RESULTS POPUP
========================================================================= */

const resultsPopup =
    document.getElementById("resultsPopup");

const resultsPopupOverlay =
    document.getElementById("resultsPopupOverlay");

const closeResultsPopup =
    document.getElementById("closeResultsPopup");


/* =========================================================================
   SECURITY
========================================================================= */

function escapeHTML(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char])
    );

}


/* =========================================================================
   POPUP - OPEN
========================================================================= */

function openResultsPopup() {

    if (!resultsPopup) {

        console.warn(
            "resultsPopup element was not found."
        );

        return;
    }


    resultsPopup.classList.add("show");

    document.body.classList.add("popup-open");


    /*
     * Start popup from the results list.
     */

    const popupContent =
        resultsPopup.querySelector(
            ".results-popup-content"
        );


    if (popupContent) {

        popupContent.scrollTop = 0;

    }

}


/* =========================================================================
   POPUP - CLOSE
========================================================================= */

function closeResultsPopupFn() {

    if (!resultsPopup) {
        return;
    }


    resultsPopup.classList.remove("show");

    document.body.classList.remove("popup-open");


    /*
     * Hide office details.
     */

    if (details) {

        details.classList.remove("show");

    }


    /*
     * Remove active card.
     */

    document
        .querySelectorAll(".card")
        .forEach(card => {

            card.classList.remove("active");

        });

}


/* =========================================================================
   POPUP CLOSE BUTTON
========================================================================= */

if (closeResultsPopup) {

    closeResultsPopup.addEventListener(
        "click",
        closeResultsPopupFn
    );

}


/* =========================================================================
   POPUP OVERLAY CLICK
========================================================================= */

if (resultsPopupOverlay) {

    resultsPopupOverlay.addEventListener(
        "click",
        closeResultsPopupFn
    );

}


/* =========================================================================
   ESC KEY
========================================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            resultsPopup &&
            resultsPopup.classList.contains("show")
        ) {

            closeResultsPopupFn();

        }

    }
);


/* =========================================================================
   LOAD PINCODE INDEX
========================================================================= */

async function loadIndex() {

    if (status) {

        status.textContent =
            "Loading pincode index...";

    }


    if (searchBtn) {

        searchBtn.disabled = true;

    }


    try {

        const response = await fetch(
            `${API_BASE}/index.json`,
            {
                method: "GET",

                headers: {
                    "Accept": "application/json"
                },

                cache: "force-cache"
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        INDEX = await response.json();


        if (status) {

            status.textContent =
                `Ready · ${Object.keys(INDEX).length.toLocaleString()} pincodes available`;

        }


        if (searchBtn) {

            searchBtn.disabled = false;

        }


    } catch (error) {

        console.error(
            "Index loading error:",
            error
        );


        if (status) {

            status.textContent =
                "Unable to load the pincode database.";

        }


        if (searchBtn) {

            searchBtn.disabled = true;

        }

    }

}


/* =========================================================================
   SEARCH PINCODE
========================================================================= */

async function searchPincode(pin) {

    /*
     * Close previous popup.
     */

    closeResultsPopupFn();


    /*
     * Clear previous offices.
     */

    currentOffices = [];


    if (details) {

        details.classList.remove("show");

    }


    if (count) {

        count.style.display = "none";

    }


    /*
     * Loading state.
     */

    if (results) {

        results.innerHTML = `

            <div class="empty">

                <div class="empty-icon">

                    <span
                        class="loader"
                        style="
                            border-color:#cbd5e1;
                            border-top-color:#2563eb;
                        ">
                    </span>

                </div>

                <strong>
                    Finding Branch Offices...
                </strong>

                <div>
                    Loading data for
                    ${escapeHTML(pin)}
                </div>

            </div>

        `;

    }


    /*
     * Find shard.
     */

    const shard =
        INDEX[pin];


    if (!shard) {

        showEmpty(
            "No pincode found",
            `We couldn't find ${pin} in the available pincode database.`
        );

        return;

    }


    try {

        /*
         * Download only required shard.
         */

        const response = await fetch(
            `${API_BASE}/${encodeURIComponent(shard)}`,
            {
                method: "GET",

                headers: {
                    "Accept": "application/json"
                },

                cache: "force-cache"
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const shardData =
            await response.json();


        /*
         * Only BO records.
         */

        currentOffices =
            shardData.filter(record =>

                String(record.pincode).trim() === pin &&

                String(record.officetype)
                    .trim()
                    .toUpperCase() === "BO"

            );


        /*
         * No BO found.
         */

        if (!currentOffices.length) {

            showEmpty(
                "No Branch Office found",
                `No BO record is available for pincode ${pin}.`
            );

            return;

        }


        /*
         * Render results.
         */

        renderOffices(
            currentOffices
        );


    } catch (error) {

        console.error(
            "Shard loading error:",
            error
        );


        showEmpty(
            "Unable to load data",
            "Please check your internet connection and try again."
        );

    }

}


/* =========================================================================
   RENDER OFFICE CARDS
========================================================================= */

function renderOffices(offices) {

    if (!results) {
        return;
    }


    /*
     * Clear previous cards.
     */

    results.innerHTML = "";


    /*
     * Heading.
     */

    if (resultsTitle) {

        resultsTitle.textContent =
            `Branch Offices · ${
                input ? input.value : ""
            }`;

    }


    /*
     * Count.
     */

    if (count) {

        count.textContent =
            `${offices.length} ${
                offices.length === 1
                    ? "office"
                    : "offices"
            }`;

        count.style.display =
            "inline-block";

    }


    /*
     * Create each BO card.
     */

    offices.forEach(office => {

        const card =
            document.createElement("article");


        card.className =
            "card";


        card.innerHTML = `

            <div class="card-top">

                <span class="badge">
                    ● BRANCH OFFICE
                </span>

            </div>


            <h3>
                ${escapeHTML(
                    office.officename
                )}
            </h3>


            <div class="card-info">


                <div class="row">

                    <span class="icon">
                        ⌖
                    </span>

                    <span>

                        <strong>
                            District:
                        </strong>

                        ${escapeHTML(
                            office.district
                        )}

                    </span>

                </div>


                <div class="row">

                    <span class="icon">
                        ▣
                    </span>

                    <span>

                        <strong>
                            State:
                        </strong>

                        ${escapeHTML(
                            office.statename
                        )}

                    </span>

                </div>


                


            </div>


            <div class="view">

                <span>
                    View location
                </span>

                <span>
                    →
                </span>

            </div>

        `;


        /*
         * Card click.
         */

        card.addEventListener(
            "click",
            () => {


                /*
                 * Remove previous active card.
                 */

                document
                    .querySelectorAll(".card")
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                /*
                 * Activate clicked card.
                 */

                card.classList.add(
                    "active"
                );


                /*
                 * Show details.
                 */

                showOffice(
                    office
                );

            }
        );


        results.appendChild(
            card
        );

    });


    /*
     * IMPORTANT:
     *
     * Do NOT automatically select
     * the first office.
     *
     * Open only the results popup.
     */

    openResultsPopup();

}


/* =========================================================================
   SHOW OFFICE DETAILS
========================================================================= */

function showOffice(office) {

    if (
        !selectedOffice ||
        !selectedSubtitle ||
        !selectedInfo ||
        !mapWrap ||
        !details
    ) {

        return;

    }


    /*
     * Office name.
     */

    selectedOffice.textContent =
        office.officename ||
        "Branch Office";


    /*
     * Subtitle.
     */

    selectedSubtitle.textContent =
        `${office.district || ""}, ${
            office.statename || ""
        }`;


    /*
     * Office information.
     */

    selectedInfo.innerHTML = `

        <div class="detail-item">

            <span>
                Pincode
            </span>

            <strong>
                ${escapeHTML(
                    office.pincode
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>
                Office Type
            </span>

            <strong>
                ${escapeHTML(
                    office.officetype
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>
                District
            </span>

            <strong>
                ${escapeHTML(
                    office.district
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>
                State
            </span>

            <strong>
                ${escapeHTML(
                    office.statename
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>
                Circle
            </span>

            <strong>
                ${escapeHTML(
                    office.circlename
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>
                Region
            </span>

            <strong>
                ${escapeHTML(
                    office.regionname
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>
                Division
            </span>

            <strong>
                ${escapeHTML(
                    office.divisionname
                )}
            </strong>

        </div>


        <div class="detail-item">

            <span>
                Coordinates
            </span>

            <strong>
                ${escapeHTML(
                    office.latitude
                )},
                ${escapeHTML(
                    office.longitude
                )}
            </strong>

        </div>

    `;


    /*
     * Coordinates.
     */

    const lat =
        Number(office.latitude);

    const lon =
        Number(office.longitude);


    /*
     * Google Maps.
     *
     * t=h = satellite + labels
     * z=17 = zoom
     */

    if (
        Number.isFinite(lat) &&
        Number.isFinite(lon)
    ) {


        const googleMapURL =
            `https://www.google.com/maps?q=` +
            `${encodeURIComponent(lat)},` +
            `${encodeURIComponent(lon)}` +
            `&t=h&z=17&output=embed`;


        const googleMapsLink =
            `https://www.google.com/maps?q=` +
            `${encodeURIComponent(lat)},` +
            `${encodeURIComponent(lon)}`;


        mapWrap.innerHTML = `

            <iframe

                class="map"

                src="${googleMapURL}"

                title="${escapeHTML(
                    office.officename ||
                    "Branch Office"
                )} location map"

                loading="lazy"

                referrerpolicy="no-referrer-when-downgrade"

                allowfullscreen>

            </iframe>


            <div class="map-footer">

                <span>

                    Coordinates:
                    ${escapeHTML(lat)},
                    ${escapeHTML(lon)}

                </span>


                <a

                    href="${googleMapsLink}"

                    target="_blank"

                    rel="noopener noreferrer">

                    Open in Google Maps ↗

                </a>

            </div>

        `;


    } else {


        /*
         * Coordinates unavailable.
         */

        mapWrap.innerHTML = `

            <div
                class="empty"
                style="
                    height:100%;
                    border:0;
                    border-radius:0;
                "
            >

                <div class="empty-icon">
                    ⌖
                </div>


                <strong>
                    Location unavailable
                </strong>


                <div>

                    Latitude and longitude
                    are not available for
                    this office.

                </div>

            </div>

        `;

    }


    /*
     * Show details.
     */

    details.classList.add(
        "show"
    );


    /*
     * Scroll inside popup.
     *
     * We DO NOT use:
     * details.scrollIntoView()
     *
     * because that would scroll
     * the entire webpage.
     */

    requestAnimationFrame(() => {


        if (!resultsPopup) {
            return;
        }


        const popupContent =
            resultsPopup.querySelector(
                ".results-popup-content"
            );


        if (!popupContent) {
            return;
        }


        const detailsTop =
            details.offsetTop -
            popupContent.offsetTop -
            10;


        popupContent.scrollTo({

            top:
                Math.max(
                    0,
                    detailsTop
                ),

            behavior:
                "smooth"

        });

    });

}


/* =========================================================================
   EMPTY STATE
========================================================================= */

function showEmpty(
    title,
    description
) {

    /*
     * Close popup.
     */

    closeResultsPopupFn();


    /*
     * Reset title.
     */

    if (resultsTitle) {

        resultsTitle.textContent =
            "Branch Offices";

    }


    /*
     * Hide count.
     */

    if (count) {

        count.style.display =
            "none";

    }


    if (!results) {
        return;
    }


    /*
     * Display empty message.
     */

    results.innerHTML = `

        <div
            class="empty"
            style="grid-column:1/-1"
        >

            <div class="empty-icon">
                ⌕
            </div>


            <strong>
                ${escapeHTML(title)}
            </strong>


            <div>
                ${escapeHTML(description)}
            </div>

        </div>

    `;

}


/* =========================================================================
   SEARCH FORM
========================================================================= */

if (form) {

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const pin =
                input
                    ? input.value.trim()
                    : "";


            /*
             * Validate six digits.
             */

            if (!/^\d{6}$/.test(pin)) {

                showEmpty(
                    "Invalid pincode",
                    "Please enter exactly 6 digits."
                );


                if (input) {

                    input.focus();

                }


                return;

            }


            /*
             * Check API index.
             */

            if (!Object.keys(INDEX).length) {

                if (status) {

                    status.textContent =
                        "The pincode database is still loading.";

                }

                return;

            }


            /*
             * Search.
             */

            searchPincode(
                pin
            );

        }
    );

}


/* =========================================================================
   INPUT VALIDATION
========================================================================= */

if (input) {

    input.addEventListener(
        "input",
        () => {

            input.value =
                input.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

        }
    );

}


/* =========================================================================
   CLOSE OFFICE DETAILS
========================================================================= */

if (closeDetails) {

    closeDetails.addEventListener(
        "click",
        () => {


            /*
             * Hide details.
             */

            if (details) {

                details.classList.remove(
                    "show"
                );

            }


            /*
             * Remove selected card.
             */

            document
                .querySelectorAll(".card")
                .forEach(card => {

                    card.classList.remove(
                        "active"
                    );

                });


            /*
             * Scroll popup back to results.
             */

            if (resultsPopup) {

                const popupContent =
                    resultsPopup.querySelector(
                        ".results-popup-content"
                    );


                if (popupContent) {

                    popupContent.scrollTo({

                        top: 0,

                        behavior:
                            "smooth"

                    });

                }

            }

        }
    );

}


/* =========================================================================
   POPULAR PINCODE BUTTONS
========================================================================= */

document
    .querySelectorAll(
        ".popular-pincodes [data-pincode]"
    )
    .forEach(button => {


        button.addEventListener(
            "click",
            () => {


                const pin =
                    button.dataset.pincode;


                /*
                 * Put pincode in search box.
                 */

                if (input) {

                    input.value =
                        pin;

                }


                /*
                 * Wait for index.
                 */

                if (
                    !Object.keys(INDEX).length
                ) {

                    if (status) {

                        status.textContent =
                            "The pincode database is still loading.";

                    }

                    return;

                }


                /*
                 * Search.
                 */

                searchPincode(
                    pin
                );

            }
        );

    });


/* =========================================================================
   INITIALIZE
========================================================================= */

loadIndex();