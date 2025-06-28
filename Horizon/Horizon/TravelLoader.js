// TravelLoader.js (Advanced UI/UX with Travel-Themed Stickers)
// Hackathon-ready modern 3D loader using Three.js

let TravelLoader = (function () {
    let container, renderer, scene, camera, globe, animationId, progressRing;
    let progress = 0, loading = true;
    let stickerMeshes = [];

    const ANIMATION_SPEED = 0.015;
    const STICKER_TEXTURES = [
        'https://cdn-icons-png.flaticon.com/512/201/201623.png', // Plane
        'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Map pin
        'https://cdn-icons-png.flaticon.com/512/1029/1029183.png', // Suitcase
        'https://cdn-icons-png.flaticon.com/512/1046/1046876.png', // Mobile
        'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', // Statue of Liberty
        'https://cdn-icons-png.flaticon.com/512/511/511485.png',   // Eiffel Tower
        'https://cdn-icons-png.flaticon.com/512/189/189001.png',   // Globe
        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Woman tourist
        'https://cdn-icons-png.flaticon.com/512/3135/3135713.png', // Man tourist
        'https://cdn-icons-png.flaticon.com/512/3176/3176296.png'  // I Love Travel
    ];

    function createLoaderDOM() {
        container = document.createElement('div');
        container.id = 'travel-loader';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.background = 'linear-gradient(120deg, #a1c4fd 0%, #c2ffd8 30%, #fbc2eb 60%, #f9f586 100%)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.zIndex = '9999';
        container.style.transition = 'opacity 0.8s ease';
        container.style.opacity = '1';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);

        const glow = document.createElement('div');
        Object.assign(glow.style, {
            position: 'absolute', width: '320px', height: '320px', borderRadius: '50%',
            background: 'radial-gradient(circle, #ffd5e0aa, transparent)',
            top: 'calc(50% - 160px)', left: 'calc(50% - 160px)',
            filter: 'blur(60px)', zIndex: 0
        });
        container.appendChild(glow);

        const msg = document.createElement('div');
        msg.innerText = 'Booking your adventure...';
        Object.assign(msg.style, {
            fontFamily: 'Poppins, sans-serif', fontSize: '22px', color: '#444',
            marginTop: '200px', opacity: 0.9, zIndex: 10, animation: 'fadeInOut 2.5s infinite'
        });
        container.appendChild(msg);

        const style = document.createElement('style');
        style.innerHTML = `
        @keyframes fadeInOut {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }`;
        document.head.appendChild(style);

        progressRing = document.createElement('canvas');
        progressRing.width = 90;
        progressRing.height = 90;
        Object.assign(progressRing.style, {
            position: 'absolute', top: 'calc(50% + 100px)', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 10, filter: 'drop-shadow(0 0 12px #ffaabbcc)'
        });
        container.appendChild(progressRing);
    }

    function drawProgressRing(percent) {
        const ctx = progressRing.getContext('2d');
        ctx.clearRect(0, 0, 90, 90);

        ctx.beginPath();
        ctx.arc(45, 45, 40, 0, 2 * Math.PI);
        ctx.strokeStyle = '#eeeeee55';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(45, 45, 40, -Math.PI / 2, (2 * Math.PI) * percent - Math.PI / 2);
        const grad = ctx.createLinearGradient(0, 0, 90, 90);
        grad.addColorStop(0, '#ff6fcb');
        grad.addColorStop(1, '#ffc3a0');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function setupThree() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(0, 0, 4.2);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(260, 260);
        renderer.domElement.style.borderRadius = '50%';
        renderer.domElement.style.background = 'transparent';
        renderer.domElement.style.boxShadow = '0 4px 24px #0002';
        container.appendChild(renderer.domElement);

        const globeGeo = new THREE.SphereGeometry(1, 64, 64);
        const globeMat = new THREE.MeshStandardMaterial({ color: 0xfff6fa, roughness: 0.45, metalness: 0.5 });
        globe = new THREE.Mesh(globeGeo, globeMat);
        scene.add(globe);

        const loader = new THREE.TextureLoader();
        STICKER_TEXTURES.forEach((src, i) => {
            loader.load(src, (texture) => {
                const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const geo = new THREE.PlaneGeometry(0.5, 0.5);
                const mesh = new THREE.Mesh(geo, mat);
                const orbit = 1.6 + (i % 3) * 0.2;
                const y = ((i % 2) * 2 - 1) * 0.6;
                mesh.position.set(Math.cos(i) * orbit, y, Math.sin(i) * orbit);
                mesh.userData = { orbit, speed: 0.5 + (i % 5) * 0.2, y, phase: i };
                scene.add(mesh);
                stickerMeshes.push(mesh);
            });
        });

        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        const dir = new THREE.DirectionalLight(0xffcccc, 1.2);
        dir.position.set(3, 3, 5);
        const point = new THREE.PointLight(0xffbbdd, 1.5, 8);
        point.position.set(1, 2, 2);

        scene.add(ambient, dir, point);
    }

    function animate() {
        if (!loading) return;
        stickerMeshes.forEach(obj => {
            const tt = Date.now() * 0.001 * obj.userData.speed;
            obj.position.x = Math.cos(tt + obj.userData.phase) * obj.userData.orbit;
            obj.position.z = Math.sin(tt + obj.userData.phase) * obj.userData.orbit;
            obj.position.y = obj.userData.y + Math.sin(tt * 2) * 0.05;
            obj.lookAt(camera.position);
        });
        globe.rotation.y += 0.0025;
        renderer.render(scene, camera);
        progress = (progress + 0.01) % 1;
        drawProgressRing(progress);
        animationId = requestAnimationFrame(animate);
    }

    function show() {
        if (document.getElementById('travel-loader')) return;
        createLoaderDOM();
        setupThree();
        loading = true;
        animate();
    }

    function hide() {
        if (!container) return;
        loading = false;
        container.style.opacity = 0;
        setTimeout(() => {
            if (renderer) {
                renderer.dispose();
                renderer.forceContextLoss && renderer.forceContextLoss();
            }
            if (container.parentNode) container.parentNode.removeChild(container);
            container = null;
        }, 800);
    }

    return { show, hide };
})();

if (typeof module !== 'undefined') module.exports = TravelLoader;
