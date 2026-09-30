const API = {
    async checkHealth() {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000);
            const res = await fetch('/api/health', { signal: controller.signal });
            clearTimeout(id);
            return res.ok;
        } catch {
            return false;
        }
    },
    async simulate(payload) {
        try {
            const res = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Backend failed");
            return await res.json();
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    async compare(payload) {
        try {
            const res = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Backend failed");
            return await res.json();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
};