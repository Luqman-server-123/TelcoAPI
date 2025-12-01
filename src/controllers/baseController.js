class BaseController {
    /**
     * ✅ SUCCESS RESPONSE (Standar Dokumen Baru)
     * Menerjemahkan logic sendResponse() dari Laravel
     */
    sendResponse(res, result, message) {
        const response = {
            success: true,
            message: message,
            data: result,
            meta: {
                timestamp: new Date().toISOString(), // Format 2025-11-25T...
                version: '1.0',
            },
        };

        // Deteksi Pagination
        // Kita cek apakah result punya property 'data' dan 'meta' (Sesuai output UserRepository tadi)
        if (result && result.data && result.meta) {
            response.data = result.data; // Ambil data aslinya saja

            // Buat blok pagination sesuai dokumen
            response.pagination = {
                total: result.meta.total,
                count: result.data.length,
                per_page: result.meta.per_page,
                current_page: result.meta.page,
                total_pages: result.meta.total_pages,
                // Hitung offset manual kalau belum ada
                offset: (result.meta.page - 1) * result.meta.per_page, 
            };
        }

        return res.status(200).json(response);
    }

    /**
     * ❌ ERROR RESPONSE (Standar Dokumen Baru)
     * Menerjemahkan logic sendError() dari Laravel
     */
    sendError(res, error, errorMessages = [], code = 404) {
        const response = {
            success: false,
            message: error,
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        };

        // Kalau array errorMessages tidak kosong
        if (errorMessages && errorMessages.length > 0) {
            response.errors = errorMessages;
        }

        return res.status(code).json(response);
    }
}

module.exports = BaseController;