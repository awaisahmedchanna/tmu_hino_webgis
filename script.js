/* ===============================
   1. Initialize Map
================================ */
var map = L.map('map').setView([35.6586, 139.3827], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

/* ===============================
   2. Campus Building Data
================================ */
var buildings = [
    {
        name: "Lecture Building",
        description: "Main lecture halls and classrooms.",
        image: "./lecture.jpg",
        lat: 35.6591,
        lon: 139.3831
    },
    {
        name: "Library",
        description: "University library and study spaces.",
        image: "./library.jpg",
        lat: 35.6583,
        lon: 139.3819
    },
    {
        name: "Student Cafeteria",
        description: "Cafeteria for students and staff.",
        image: "./cafeteria.jpg",
        lat: 35.6579,
        lon: 139.3828
    },
    {
        name: "Research Building A",
        description: "Research laboratories and faculty offices.",
        image: "researchbuildingA.jpg",
        lat: 35.6588,
        lon: 139.3825
    },
    {
        name: "Research Building B",
        description: "Advanced research and innovation center.",
        image: "researchbuildingB.jpg",
        lat: 35.6586,
        lon: 139.3822
    },
    {
        name: "Administration Building",
        description: "Administrative offices and student services.",
        image: "adminBuilding.jpeg",
        lat: 35.6590,
        lon: 139.3818
    },
    {
        name: "Student Center",
        description: "Student activities, clubs, and common areas.",
        image: "./student_center.jpg",
        lat: 35.6581,
        lon: 139.3821
    },
    {
        name: "Sports Gymnasium",
        description: "Indoor sports and fitness facilities.",
        image: "gymnesium.jpg",
        lat: 35.6576,
        lon: 139.3816
    },
    {
        name: "Engineering Workshop",
        description: "Hands-on engineering and prototyping labs.",
        image: "eng.jpg",
        lat: 35.6593,
        lon: 139.3829
    },
    {
        name: "Main Entrance Gate",
        description: "Primary entrance to TMU Hino Campus.",
        image: "mainGate.jpg",
        lat: 35.6585,
        lon: 139.3834
    }
];


/* ===============================
   3. DBSCAN PARAMETERS
================================ */
//var EPS = 0.001;   // neighborhood radius (approx ~100m)
var EPS = 0.00045; // neighborhood radius (approx ~50m)
var MIN_PTS = 2;  // minimum points to form a cluster

/* ===============================
   4. Distance Function
   (Simple Euclidean for demo)
================================ */
function distance(a, b) {
    var dx = a.lat - b.lat;
    var dy = a.lon - b.lon;
    return Math.sqrt(dx * dx + dy * dy);
}

/* ===============================
   5. DBSCAN ALGORITHM
================================ */
function dbscan(points, eps, minPts) {
    let clusterId = 0;
    points.forEach(p => p.cluster = undefined);

    function regionQuery(p) {
        return points.filter(q => distance(p, q) <= eps);
    }

    function expandCluster(p, neighbors, clusterId) {
        p.cluster = clusterId;

        for (let i = 0; i < neighbors.length; i++) {
            let n = neighbors[i];

            if (n.cluster === undefined) {
                n.cluster = clusterId;
                let nNeighbors = regionQuery(n);
                if (nNeighbors.length >= minPts) {
                    neighbors = neighbors.concat(nNeighbors);
                }
            }
        }
    }

    points.forEach(p => {
        if (p.cluster !== undefined) return;

        let neighbors = regionQuery(p);
        if (neighbors.length < minPts) {
            p.cluster = -1; // noise
        } else {
            clusterId++;
            expandCluster(p, neighbors, clusterId);
        }
    });
}

/* ===============================
   6. Run DBSCAN
================================ */
dbscan(buildings, EPS, MIN_PTS);

/* ===============================
   7. Cluster Colors
================================ */
var colors = {
    1: "red",
    2: "blue",
    3: "green",
    "-1": "gray"
};

/* ===============================
   8. Add Markers to Map
================================ */
buildings.forEach(b => {

    var color = colors[b.cluster] || "black";

    var marker = L.circleMarker([b.lat, b.lon], {
        radius: 10,
        color: color,
        fillColor: color,
        fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(
        "<b>" + b.name + "</b><br>" +
        b.description + "<br><br>" +
        "<img class='popup-img' src='" + b.image + "'><br><br>" +
        "<b>Cluster:</b> " + (b.cluster === -1 ? "Noise" : b.cluster)
    );
});