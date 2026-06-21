document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('usernameInput');
    const inlineLoader = document.getElementById('inlineLoader');
    const errorPanel = document.getElementById('errorPanel');
    const skeletonTemplate = document.getElementById('skeletonTemplate');
    const realDataContainer = document.getElementById('realDataContainer');

    const langColors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Python: '#3572A5',
        Java: '#b07219',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        PHP: '#4f5d95',
        Ruby: '#701516',
        Go: '#00ADD8',
        Swift: '#F05138',
        Shell: '#89e051'
    };

    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    }

    const doSearch = debounce((username) => {
        const query = username.trim();
        if (!query) {
            resetUI();
            return;
        }
        fetchData(query);
    }, 600);

    usernameInput.addEventListener('input', (e) => {
        inlineLoader.classList.add('active');
        doSearch(e.target.value);
    });

    async function fetchData(username) {
        updateUIState('loading');

        try {
            const [userRes, reposRes] = await Promise.all([
                fetch(`https://api.github.com/users/${username}`),
                fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`)
            ]);
            
            if (!userRes.ok) {
                throw new Error('User not found or rate limit');
            }

            const userData = await userRes.json();
            const reposData = reposRes.ok ? await reposRes.json() : [];
            
            renderDashboard(userData, reposData);
        } catch (err) {
            console.error(err);
            updateUIState('error');
        } finally {
            inlineLoader.classList.remove('active');
        }
    }

    function updateUIState(state) {
        if (state === 'loading') {
            skeletonTemplate.style.display = 'block';
            errorPanel.style.display = 'none';
            realDataContainer.className = 'profile-card data-hidden';
        } else if (state === 'error') {
            skeletonTemplate.style.display = 'none';
            errorPanel.style.display = 'flex';
            realDataContainer.className = 'profile-card data-hidden';
        } else {
            skeletonTemplate.style.display = 'none';
            errorPanel.style.display = 'none';
            realDataContainer.className = 'profile-card data-visible';
        }
    }

    function resetUI() {
        inlineLoader.classList.remove('active');
        skeletonTemplate.style.display = 'block';
        errorPanel.style.display = 'none';
        realDataContainer.className = 'profile-card data-hidden';
        realDataContainer.innerHTML = '';
    }

    function renderDashboard(user, repos) {
        realDataContainer.innerHTML = '';

        const date = new Date(user.created_at);
        const joinedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

        const metaBlock = document.createElement('div');
        metaBlock.className = 'profile-meta-block';

        const img = document.createElement('img');
        img.src = user.avatar_url;
        img.alt = user.login;
        img.className = 'user-avatar';

        const identity = document.createElement('div');
        identity.className = 'user-identity';

        const h2 = document.createElement('h2');
        const a = document.createElement('a');
        a.href = user.html_url;
        a.target = '_blank';
        a.textContent = user.name || user.login;
        h2.append(a);

        const handle = document.createElement('p');
        handle.className = 'github-handle';
        handle.textContent = `@${user.login}`;

        const joined = document.createElement('p');
        joined.className = 'joined-date';
        joined.innerHTML = `<i class="fa-solid fa-calendar-days"></i> Joined ${joinedDate}`;

        identity.append(h2, handle, joined);
        metaBlock.append(img, identity);

        const bio = document.createElement('p');
        bio.className = 'user-bio';
        bio.textContent = user.bio || "This profile has no bio.";

        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-metrics-grid';

        const metrics = [
            { label: 'Repos', val: user.public_repos },
            { label: 'Followers', val: user.followers },
            { label: 'Following', val: user.following }
        ];

        metrics.forEach(m => {
            const box = document.createElement('div');
            box.className = 'metric-box';
            const title = document.createElement('h4');
            title.textContent = m.label;
            const count = document.createElement('p');
            count.textContent = m.val;
            box.append(title, count);
            statsGrid.append(box);
        });

        const detailsGrid = document.createElement('div');
        detailsGrid.className = 'user-extra-details';

        const details = [
            { icon: 'fa-location-dot', text: user.location },
            { icon: 'fa-link', text: user.blog, link: true },
            { icon: 'fa-building', text: user.company },
            { icon: 'fa-twitter', text: user.twitter_username, twitter: true }
        ];

        details.forEach(item => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            
            const icon = document.createElement('i');
            icon.className = item.icon === 'fa-twitter' ? 'fa-brands fa-twitter' : `fa-solid ${item.icon}`;
            
            const span = document.createElement('span');
            if (item.text) {
                if (item.link) {
                    const l = document.createElement('a');
                    l.href = item.text.startsWith('http') ? item.text : `https://${item.text}`;
                    l.target = '_blank';
                    l.textContent = item.text;
                    span.append(l);
                } else if (item.twitter) {
                    span.textContent = `@${item.text}`;
                } else {
                    span.textContent = item.text;
                }
            } else {
                span.textContent = "Not Available";
                div.style.opacity = '0.4';
            }
            div.append(icon, span);
            detailsGrid.append(div);
        });

        const sectionTitle = document.createElement('h3');
        sectionTitle.className = 'repos-section-title';
        sectionTitle.innerHTML = `<i class="fa-solid fa-code-branch"></i> Recent Active Repositories`;

        const listWrapper = document.createElement('div');
        listWrapper.className = 'repos-list-wrapper';

        if (repos.length === 0) {
            const noRepos = document.createElement('p');
            noRepos.textContent = "No public repositories found.";
            noRepos.style.color = 'var(--text-muted)';
            listWrapper.append(noRepos);
        } else {
            repos.forEach(repo => {
                const card = document.createElement('div');
                card.className = 'repo-item-card';

                const header = document.createElement('div');
                header.className = 'repo-header-line';

                const rLink = document.createElement('a');
                rLink.href = repo.html_url;
                rLink.target = '_blank';
                rLink.className = 'repo-name-link';
                rLink.textContent = repo.name;
                header.append(rLink);

                const desc = document.createElement('p');
                desc.className = 'repo-description-text';
                desc.textContent = repo.description || "No description provided for this repository.";

                const footer = document.createElement('div');
                footer.className = 'repo-meta-footer';

                if (repo.language) {
                    const badge = document.createElement('div');
                    badge.className = 'tech-lang-badge';

                    const sphere = document.createElement('span');
                    sphere.className = 'tech-lang-sphere';
                    sphere.style.backgroundColor = langColors[repo.language] || '#8b949e';

                    const txt = document.createElement('span');
                    txt.textContent = repo.language;

                    badge.append(sphere, txt);
                    footer.append(badge);
                }

                const counters = document.createElement('div');
                counters.className = 'repo-stats-counters';

                const star = document.createElement('div');
                star.className = 'stat-counter-badge';
                star.innerHTML = `<i class="fa-regular fa-star"></i> ${repo.stargazers_count}`;

                const fork = document.createElement('div');
                fork.className = 'stat-counter-badge';
                fork.innerHTML = `<i class="fa-solid fa-code-fork"></i> ${repo.forks_count}`;

                counters.append(star, fork);
                footer.append(counters);

                card.append(header, desc, footer);
                listWrapper.append(card);
            });
        }

        realDataContainer.append(metaBlock, bio, statsGrid, detailsGrid, sectionTitle, listWrapper);
        updateUIState('success');
    }
});