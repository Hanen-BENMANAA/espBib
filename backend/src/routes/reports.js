// Submit new report
router.post(
  '/submit',
  authenticateToken,
  authorizeRoles('student'),
  upload.single('file'),
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const userId = req.user.id;

      const {
        title,
        authorFirstName,
        authorLastName,
        studentNumber,
        email,
        specialty,
        academicYear,
        supervisor,
        coSupervisor,
        hostCompany, // OPTIONAL
        defenseDate,
        keywords,
        abstract,
        allowPublicAccess,
        isConfidential
      } = req.body;

      const file = req.file;

      if (!file) {
        throw new Error('Fichier PDF requis');
      }

      // Parse keywords if it's a string
      const keywordsArray =
        typeof keywords === 'string'
          ? keywords.split(',').map((k) => k.trim())
          : keywords;

      // Generate file URL
      const fileUrl = `/uploads/reports/${file.filename}`;

      // INSERT including all required table columns
      const result = await client.query(
        `INSERT INTO reports (
          user_id, title, author_first_name, author_last_name,
          student_number, email, specialty, academic_year,
          supervisor, co_supervisor, host_company, defense_date,
          keywords, abstract, allow_public_access, is_confidential,
          file_name, file_path, file_size, file_url, status,
          submission_date, last_modified, version
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
                $17, $18, $19, $20, $21, NOW(), NOW(), 1)
        RETURNING id, title, status, submission_date`,
        [
          userId,
          title,
          authorFirstName,
          authorLastName,
          studentNumber,
          email,
          specialty,
          academicYear,
          supervisor,
          coSupervisor,
          hostCompany || null, // OPTIONAL
          defenseDate,
          keywordsArray,
          abstract,
          allowPublicAccess === 'false' ? false : true,
          isConfidential === 'true',
          file.filename,
          file.path,
          file.size,
          fileUrl,
          'pending'
        ]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Rapport soumis avec succès',
        data: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error submitting report:', error);
      res.status(500).json({
        success: false,
        message:
          error.message || 'Erreur lors de la soumission du rapport'
      });
    } finally {
      client.release();
    }
  }
);
